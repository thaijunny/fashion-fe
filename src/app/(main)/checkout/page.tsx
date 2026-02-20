'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getImageUrl } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    MapPin,
    Phone,
    User as UserIcon,
    CreditCard,
    Truck,
    CheckCircle2,
    ChevronRight,
    ShieldCheck,
    Building2,
    Wallet,
    AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? '/api'
        : 'http://localhost:5000/api');

interface Province { code: number; name: string; }
interface District { code: number; name: string; }
interface Ward { code: number; name: string; }

export default function CheckoutPage() {
    const { items, total, itemCount, clearCart } = useCart();
    const { user, token } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        province: '',
        district: '',
        ward: '',
        street: '',
        payment_method: 'cod'
    });

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || ''
            }));
        }
    }, [user]);

    // Load Provinces
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(() => setError('Không thể tải danh sách tỉnh thành'));
    }, []);

    // Load Districts
    useEffect(() => {
        if (!formData.province) {
            setDistricts([]);
            setWards([]);
            return;
        }
        const province = provinces.find(p => p.name === formData.province);
        if (province) {
            setIsLoadingAddress(true);
            fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
                .then(res => res.json())
                .then(data => {
                    setDistricts(data.districts);
                    setWards([]);
                    setFormData(prev => ({ ...prev, district: '', ward: '' }));
                })
                .finally(() => setIsLoadingAddress(false));
        }
    }, [formData.province, provinces]);

    // Load Wards
    useEffect(() => {
        if (!formData.district) {
            setWards([]);
            return;
        }
        const district = districts.find(d => d.name === formData.district);
        if (district) {
            setIsLoadingAddress(true);
            fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards))
                .finally(() => setIsLoadingAddress(false));
        }
    }, [formData.district, districts]);

    const shippingFee = total > 500000 ? 0 : 30000;
    const grandTotal = total + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear validation error when user types
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (formData.full_name.length < 2) errors.full_name = 'Họ tên quá ngắn';
        if (!/^[0-9]{10,11}$/.test(formData.phone_number)) errors.phone_number = 'Số điện thoại phải có 10-11 số';
        if (!formData.province) errors.province = 'Vui lòng chọn Tỉnh/Thành';
        if (!formData.district) errors.district = 'Vui lòng chọn Quận/Huyện';
        if (!formData.ward) errors.ward = 'Vui lòng chọn Phường/Xã';
        if (formData.street.length < 5) errors.street = 'Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (!validateForm()) {
            setError('Vui lòng kiểm tra lại thông tin giao hàng');
            return;
        }

        setError(null);
        setIsLoading(true);

        const fullAddress = `${formData.street}, ${formData.ward}, ${formData.district}, ${formData.province}`;

        try {
            const res = await fetch(`${API_URL}/orders/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    phone_number: formData.phone_number,
                    shipping_address: fullAddress,
                    payment_method: formData.payment_method,
                    total_amount: grandTotal
                })
            });

            const data = await res.json();
            if (res.ok) {
                setIsSuccess(true);
                setOrderId(data.order_id);
                clearCart(); // Clear cart after success
            } else {
                setError(data.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
            }
        } catch (err) {
            setError('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center container-street text-center py-20">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">Đặt hàng thành công!</h1>
                <p className="text-gray-400 mb-2 max-w-md mx-auto">Cảm ơn bạn đã tin tưởng <strong>UNTYPED CLOTHING</strong>.</p>
                <p className="text-gray-500 text-sm mb-8">Mã đơn hàng: <span className="text-white font-mono font-bold uppercase">{orderId}</span></p>

                <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
                    <div className="bg-[#111] border border-[#2a2a2a] p-8 text-left">
                        <h3 className="text-[#e60012] font-black uppercase tracking-widest text-sm mb-4">Thông tin đơn hàng</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-[#222] pb-2 text-gray-400">
                                <span>Người nhận:</span>
                                <span className="text-white font-bold">{formData.full_name}</span>
                            </div>
                            <div className="flex justify-between border-b border-[#222] pb-2 text-gray-400">
                                <span>Số điện thoại:</span>
                                <span className="text-white font-bold">{formData.phone_number}</span>
                            </div>
                            <div className="border-b border-[#222] pb-2 text-gray-400">
                                <p>Địa chỉ:</p>
                                <p className="text-white font-medium mt-1 leading-relaxed">{formData.street}, {formData.ward}, {formData.district}, {formData.province}</p>
                            </div>
                        </div>
                    </div>

                    {formData.payment_method === 'bank_transfer' ? (
                        <div className="bg-[#111] border border-[#2a2a2a] p-8 text-left">
                            <h3 className="text-[#e60012] font-black uppercase tracking-widest text-sm mb-4">Thông tin chuyển khoản</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-[#222] pb-2">
                                    <span className="text-gray-500">Ngân hàng:</span>
                                    <span className="text-white font-bold">Vietcombank</span>
                                </div>
                                <div className="flex justify-between border-b border-[#222] pb-2">
                                    <span className="text-gray-500">Số tài khoản:</span>
                                    <span className="text-white font-bold font-mono">1023456789</span>
                                </div>
                                <div className="flex justify-between border-b border-[#222] pb-2">
                                    <span className="text-gray-500">Chủ tài khoản:</span>
                                    <span className="text-white font-bold">NGUYEN VAN A</span>
                                </div>
                                <div className="flex justify-between border-b border-[#222] pb-2">
                                    <span className="text-gray-500">Nội dung CK:</span>
                                    <span className="text-[#e60012] font-bold uppercase">{orderId}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-gray-500">Số tiền:</span>
                                    <span className="text-white font-bold">{formatPrice(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#111] border border-[#2a2a2a] p-8 text-left flex flex-col justify-center items-center">
                            <Truck size={40} className="text-[#e60012] mb-4" />
                            <p className="text-white font-bold uppercase tracking-widest text-center">Thanh toán khi nhận hàng</p>
                            <p className="text-gray-500 text-xs mt-2 text-center">Đơn hàng sẽ được xử lý và giao đến bạn trong 2-4 ngày làm việc.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link href="/products" className="btn-street px-10">
                        Tiếp tục mua sắm
                    </Link>
                    <Link href="/orders" className="bg-transparent border border-[#2a2a2a] text-white font-bold uppercase tracking-wider h-14 flex items-center justify-center px-10 hover:bg-[#1a1a1a] transition-all">
                        Xem lịch sử đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center container-street text-center">
                <h1 className="text-2xl font-bold text-white mb-6 uppercase italic font-black italic">Giỏ hàng của bạn đang trống</h1>
                <Link href="/products" className="btn-street">Quay lại mua sắm</Link>
            </div>
        );
    }

    return (
        <div className="container-street pb-24">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8 py-4">
                <Link href="/cart" className="hover:text-white transition-colors">Giỏ hàng</Link>
                <ChevronRight size={12} />
                <span className="text-white">Thanh toán</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-12">
                Thanh <span className="text-[#e60012]">Toán</span>
            </h1>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-16">
                {/* Left: Shipping & Payment */}
                <div className="lg:col-span-7 space-y-12">

                    {/* Shipping Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-[#2a2a2a] pb-4">
                            <MapPin className="text-[#e60012]" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Thông tin giao hàng</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Họ và tên</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ và tên"
                                        className={`input-street w-full !pl-12 !py-4 ${validationErrors.full_name ? 'border-[#e60012]' : ''}`}
                                    />
                                    {validationErrors.full_name && <p className="text-[#e60012] text-[10px] font-bold uppercase mt-1">{validationErrors.full_name}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        placeholder="VD: 0912345678"
                                        className={`input-street w-full !pl-12 !py-4 ${validationErrors.phone_number ? 'border-[#e60012]' : ''}`}
                                    />
                                    {validationErrors.phone_number && <p className="text-[#e60012] text-[10px] font-bold uppercase mt-1">{validationErrors.phone_number}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Tỉnh / Thành</label>
                                <select
                                    name="province"
                                    value={formData.province}
                                    onChange={handleInputChange}
                                    className={`input-street w-full !py-4 appearance-none ${validationErrors.province ? 'border-[#e60012]' : ''}`}
                                >
                                    <option value="">Chọn Tỉnh/Thành</option>
                                    {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Quận / Huyện</label>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    disabled={!formData.province || isLoadingAddress}
                                    className={`input-street w-full !py-4 appearance-none disabled:opacity-50 ${validationErrors.district ? 'border-[#e60012]' : ''}`}
                                >
                                    <option value="">Chọn Quận/Huyện</option>
                                    {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Phường / Xã</label>
                                <select
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleInputChange}
                                    disabled={!formData.district || isLoadingAddress}
                                    className={`input-street w-full !py-4 appearance-none disabled:opacity-50 ${validationErrors.ward ? 'border-[#e60012]' : ''}`}
                                >
                                    <option value="">Chọn Phường/Xã</option>
                                    {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Số nhà, tên đường</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    placeholder="VD: 123 Đường Nam Kỳ Khởi Nghĩa"
                                    className={`input-street w-full !pl-12 !py-4 ${validationErrors.street ? 'border-[#e60012]' : ''}`}
                                />
                                {validationErrors.street && <p className="text-[#e60012] text-[10px] font-bold uppercase mt-1">{validationErrors.street}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Payment Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-[#2a2a2a] pb-4">
                            <CreditCard className="text-[#e60012]" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Phương thức thanh toán</h2>
                        </div>

                        <div className="grid gap-4">
                            <label
                                className={`relative flex items-center gap-4 p-6 border-2 cursor-pointer transition-all ${formData.payment_method === 'bank_transfer'
                                    ? 'border-[#e60012] bg-[#e60012]/5'
                                    : 'border-[#2a2a2a] bg-[#111] hover:border-[#444]'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="bank_transfer"
                                    checked={formData.payment_method === 'bank_transfer'}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.payment_method === 'bank_transfer' ? 'border-[#e60012]' : 'border-gray-600'}`}>
                                    {formData.payment_method === 'bank_transfer' && <div className="w-3 h-3 rounded-full bg-[#e60012]" />}
                                </div>
                                <div className="flex-1 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Building2 className={formData.payment_method === 'bank_transfer' ? 'text-[#e60012]' : 'text-gray-500'} size={32} />
                                        <div>
                                            <p className="font-bold text-white uppercase tracking-wider text-sm">Chuyển khoản ngân hàng</p>
                                            <p className="text-gray-500 text-xs mt-1">Hỗ trợ tất cả ngân hàng tại Việt Nam</p>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <label
                                className={`relative flex items-center gap-4 p-6 border-2 cursor-pointer transition-all ${formData.payment_method === 'cod'
                                    ? 'border-[#e60012] bg-[#e60012]/5'
                                    : 'border-[#2a2a2a] bg-[#111] hover:border-[#444]'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cod"
                                    checked={formData.payment_method === 'cod'}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.payment_method === 'cod' ? 'border-[#e60012]' : 'border-gray-600'}`}>
                                    {formData.payment_method === 'cod' && <div className="w-3 h-3 rounded-full bg-[#e60012]" />}
                                </div>
                                <div className="flex-1 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Wallet className={formData.payment_method === 'cod' ? 'text-[#e60012]' : 'text-gray-500'} size={32} />
                                        <div>
                                            <p className="font-bold text-white uppercase tracking-wider text-sm">Thanh toán khi nhận hàng (COD)</p>
                                            <p className="text-gray-500 text-xs mt-1">Kiềm tra hàng trước khi thanh toán</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-5">
                    <div className="sticky top-32 space-y-6">
                        <div className="bg-[#111] border border-[#2a2a2a] p-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8 border-b border-[#2a2a2a] pb-4">Tóm tắt đơn hàng</h2>

                            <div className="max-h-[300px] overflow-y-auto mb-8 space-y-4 pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-20 bg-[#0a0a0a] flex-shrink-0">
                                            <Image
                                                src={getImageUrl(item.product?.images?.[0] || '')}
                                                alt={item.product?.name || ''}
                                                fill
                                                className="object-cover opacity-80"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-xs truncate uppercase tracking-wider">{item.product?.name}</p>
                                            <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold">
                                                {item.size} {item.color && `/ ${item.color}`} {item.material && `/ ${item.material}`} / {item.quantity} cái
                                            </p>
                                            <p className="text-white font-mono text-xs mt-1">
                                                {formatPrice(item.product?.price ? Number(item.product.price) * item.quantity : 0)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mb-8 pt-4 border-t border-[#222]">
                                <div className="flex justify-between items-center text-gray-500">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Tạm tính</span>
                                    <span className="text-white font-bold text-sm tracking-widest">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Giao hàng</span>
                                    <span className="text-white font-bold text-sm tracking-widest">
                                        {shippingFee === 0 ? 'MIỄN PHÍ' : formatPrice(shippingFee)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-[#2a2a2a] pt-6 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black text-white uppercase tracking-tighter italic">Tổng thanh toán</span>
                                    <span className="text-3xl font-black text-[#e60012] tracking-tighter italic">{formatPrice(grandTotal)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-[#e60012]/10 border border-[#e60012]/30 text-[#e60012] text-[10px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-street w-full py-5 text-xl font-black italic tracking-tighter rounded-none flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Xác nhận đặt hàng
                                        <Truck size={24} />
                                    </>
                                )}
                            </button>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 opacity-50">
                                    <ShieldCheck size={16} className="text-green-500" />
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">An toàn tuyệt đối</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-50">
                                    <Truck size={16} className="text-green-500" />
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Miễn phí ship &gt;500k</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
