'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchMyDesignOrders, formatPrice, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import { Palette, ChevronRight, Clock, Printer, Truck, CheckCircle2, XCircle, Package } from 'lucide-react';

const statusMap: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    'pending': { label: 'Chờ xác nhận', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock },
    'confirmed': { label: 'Đã xác nhận', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 },
    'printing': { label: 'Đang in', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Printer },
    'shipped': { label: 'Đang giao hàng', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Truck },
    'done': { label: 'Hoàn thành', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 },
    'cancelled': { label: 'Đã hủy', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
};

export default function DesignOrdersPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchMyDesignOrders(token).then(data => {
                setOrders(data);
                setLoading(false);
            });
        }
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center container-street">
                <div className="w-10 h-10 border-4 border-[#e60012]/20 border-t-[#e60012] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container-street pb-24">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8 py-4">
                <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                <ChevronRight size={12} />
                <span className="text-white">Đơn thiết kế</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-12">
                Đơn <span className="text-[#e60012]">Thiết Kế</span>
            </h1>

            {orders.length === 0 ? (
                <div className="bg-[#111] border border-[#2a2a2a] p-12 text-center">
                    <Palette size={48} className="text-gray-600 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-500 uppercase font-bold tracking-widest text-sm mb-6">Bạn chưa có đơn thiết kế nào</p>
                    <Link href="/studio" className="btn-street inline-block px-10">Bắt đầu thiết kế</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const status = statusMap[order.status] || statusMap['pending'];
                        const StatusIcon = status.icon;
                        return (
                            <div key={order.id} className="bg-[#111] border border-[#2a2a2a] p-6 group hover:border-[#444] transition-all">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Preview thumbnail */}
                                    <div className="w-20 h-20 bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden flex-shrink-0">
                                        {order.project?.preview_front ? (
                                            <img
                                                src={order.project.preview_front.startsWith('data:') ? order.project.preview_front : getImageUrl(order.project.preview_front)}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Palette size={24} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <p className="text-white font-bold text-lg">{order.project?.name || 'Thiết kế'}</p>
                                        <p className="text-gray-500 text-sm">
                                            {order.garment_template?.name || 'Phôi áo'} · Size {order.garment_size} · {order.garment_color} · SL: {order.quantity}
                                        </p>
                                    </div>

                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ngày đặt</p>
                                        <p className="text-white font-bold">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                    </div>

                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tổng tiền</p>
                                        <p className="text-[#e60012] font-black italic text-xl">{formatPrice(Number(order.total_amount))}</p>
                                    </div>

                                    <div className={`flex items-center gap-2 px-4 py-2 ${status.bg} border border-white/10 rounded-none`}>
                                        <StatusIcon size={16} className={status.color} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/design-orders/${order.id}`}
                                        className="h-12 flex items-center justify-center px-6 bg-[#2a2a2a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#e60012] transition-colors"
                                    >
                                        Chi tiết
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
