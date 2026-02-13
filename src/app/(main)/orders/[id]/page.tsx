'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchOrderById, formatPrice, getImageUrl } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft,
    Package,
    MapPin,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    Calendar,
    Phone,
    User as UserIcon,
    CreditCard
} from 'lucide-react';

const statusMap: Record<string, { label: string, color: string, bg: string, icon: any, desc: string }> = {
    'pending': {
        label: 'Chờ xác nhận',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        icon: Clock,
        desc: 'Đơn hàng của bạn đang được hệ thống ghi nhận. Chúng tôi sẽ sớm xác nhận thông tin.'
    },
    'processing': {
        label: 'Đang xử lý',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        icon: Package,
        desc: 'Sản phẩm đang được chuẩn bị và đóng gói cẩn thận.'
    },
    'shipped': {
        label: 'Đang giao hàng',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        icon: Truck,
        desc: 'Đơn hàng đang trên đường đến với bạn. Vui lòng giữ điện thoại!'
    },
    'delivered': {
        label: 'Đã giao hàng',
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        icon: CheckCircle2,
        desc: 'Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua sắm!'
    },
    'cancelled': {
        label: 'Đã hủy',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        icon: XCircle,
        desc: 'Đơn hàng đã bị hủy. Hẹn gặp lại bạn ở những đơn hàng sau.'
    },
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (token && id) {
            fetchOrderById(id as string, token).then(data => {
                setOrder(data);
                setLoading(false);
            });
        }
    }, [token, id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center container-street">
                <div className="w-10 h-10 border-4 border-[#e60012]/20 border-t-[#e60012] rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center container-street text-center">
                <XCircle size={48} className="text-red-500 mb-4 opacity-20" />
                <h1 className="text-2xl font-bold text-white mb-6 uppercase italic font-black">Không tìm thấy đơn hàng</h1>
                <Link href="/orders" className="btn-street">Quay lại danh sách</Link>
            </div>
        );
    }

    const currentStatus = statusMap[order.status] || statusMap.pending;
    const StatusIcon = currentStatus.icon;

    return (
        <div className="container-street pb-24">
            <div className="flex items-center gap-4 mb-12 py-4 border-b border-[#2a2a2a]">
                <button onClick={() => router.back()} className="p-2 hover:bg-[#111] transition-all text-gray-500 hover:text-white">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Chi tiết đơn hàng</h1>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Mã đơn: <span className="text-white font-mono">{order.id}</span></p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                    {/* Status Banner */}
                    <div className={`${currentStatus.bg} border border-white/5 p-8 flex items-start gap-6`}>
                        <div className={`p-4 rounded-full ${currentStatus.color} bg-white/5`}>
                            <StatusIcon size={32} />
                        </div>
                        <div className="flex-1">
                            <h2 className={`text-xl font-black uppercase italic tracking-tighter ${currentStatus.color}`}>
                                {currentStatus.label}
                            </h2>
                            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                                {currentStatus.desc}
                            </p>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-4">
                                Cập nhật lần cuối: {new Date(order.created_at).toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#111] border border-[#2a2a2a] p-8">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8 border-b border-[#2a2a2a] pb-4">Danh sách sản phẩm</h3>
                        <div className="space-y-6">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex gap-6 pb-6 border-b border-[#1a1a1a] last:border-0 last:pb-0">
                                    <div className="relative w-24 h-32 bg-[#0a0a0a] flex-shrink-0">
                                        <Image
                                            src={getImageUrl(item.product?.images?.[0] || '')}
                                            alt={item.product?.name || ''}
                                            fill
                                            className="object-cover opacity-80"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold uppercase tracking-wider text-sm">{item.product?.name}</h4>
                                        <p className="text-gray-500 text-[10px] uppercase font-bold mt-2">
                                            Size: {item.size} {item.color && `/ Color: ${item.color}`} {item.material && `/ Material: ${item.material}`}
                                        </p>
                                        <div className="flex justify-between items-end mt-4">
                                            <p className="text-gray-500 text-xs font-bold">x {item.quantity}</p>
                                            <p className="text-white font-mono font-bold">{formatPrice(Number(item.unit_price) * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Info */}
                    <div className="bg-[#111] border border-[#2a2a2a] p-8">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8 border-b border-[#2a2a2a] pb-4">Thông tin giao hàng</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <UserIcon size={18} className="text-[#e60012] flex-shrink-0" />
                                <div>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Người nhận</p>
                                    <p className="text-white font-bold text-sm uppercase">{order.full_name}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Phone size={18} className="text-[#e60012] flex-shrink-0" />
                                <div>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Số điện thoại</p>
                                    <p className="text-white font-bold text-sm">{order.phone_number}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <MapPin size={18} className="text-[#e60012] flex-shrink-0" />
                                <div>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Địa chỉ</p>
                                    <p className="text-white text-sm leading-relaxed">{order.shipping_address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-[#111] border border-[#2a2a2a] p-8">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8 border-b border-[#2a2a2a] pb-4">Thanh toán</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tạm tính:</span>
                                <span className="text-white font-bold">{formatPrice(Number(order.total_amount) - (Number(order.total_amount) > 500000 ? 0 : 30000))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Giao hàng:</span>
                                <span className="text-white font-bold">{Number(order.total_amount) > 500000 ? 'MIỄN PHÍ' : formatPrice(30000)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-[#222]">
                                <span className="text-white font-black uppercase italic tracking-tighter">Tổng cộng:</span>
                                <span className="text-2xl font-black text-[#e60012] italic">{formatPrice(Number(order.total_amount))}</span>
                            </div>
                            <div className="mt-6 flex items-center gap-3 p-4 bg-white/5 border border-white/10 uppercase font-black text-[10px] tracking-widest text-white">
                                <CreditCard size={14} className="text-[#e60012]" />
                                HÌNH THỨC: {order.payment_method === 'cod' ? 'THANH TOÁN KHI NHẬN HÀNG' : 'CHUYỂN KHOẢN NGÂN HÀNG'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
