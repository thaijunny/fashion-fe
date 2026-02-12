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
    Wallet
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CheckoutPage() {
    const { items, total, itemCount } = useCart();
    const { user, token } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        address: '',
        payment_method: 'cod' // or 'bank_transfer'
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.full_name || ''
            }));
        }
    }, [user]);

    // Constants
    const shippingFee = total > 500000 ? 0 : 30000;
    const grandTotal = total + shippingFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setError(null);
        setIsLoading(true);

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
                    shipping_address: formData.address,
                    payment_method: formData.payment_method,
                    total_amount: grandTotal
                })
            });

            const data = await res.json();
            if (res.ok) {
                setIsSuccess(true);
                setOrderId(data.order_id);
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

                {formData.payment_method === 'bank_transfer' && (
                    <div className="bg-[#111] border border-[#2a2a2a] p-8 mb-10 text-left max-w-lg w-full">
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
                )}

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link href="/products" className="btn-street px-10">
                        Tiếp tục mua sắm
                    </Link>
                    <Link href="/" className="bg-transparent border border-[#2a2a2a] text-white font-bold uppercase tracking-wider h-14 flex items-center justify-center px-10 hover:bg-[#1a1a1a] transition-all">
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center container-street text-center">
                <h1 className="text-2xl font-bold text-white mb-6">Giỏ hàng của bạn đang trống</h1>
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
                                        required
                                        className="input-street w-full !pl-12 !py-4"
                                    />
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
                                        required
                                        className="input-street w-full !pl-12 !py-4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Địa chỉ nhận hàng</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-5 text-gray-600" size={16} />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                    required
                                    rows={3}
                                    className="input-street w-full !pl-12 !py-4 resize-none"
                                />
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
                            {/* Bank Transfer */}
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

                            {/* COD */}
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
                                                {item.size} / {item.quantity} cái
                                            </p>
                                            <p className="text-white font-mono text-xs mt-1">
                                                {formatPrice((item.product?.price || 0) * item.quantity)}
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
                                        {shippingFee === 0 ? 'MIẾN PHÍ' : formatPrice(shippingFee)}
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
                                <div className="mb-6 p-4 bg-[#e60012]/10 border border-[#e60012]/30 text-[#e60012] text-xs font-bold uppercase tracking-wider text-center">
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
