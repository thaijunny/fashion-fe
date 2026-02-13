'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserOrders, formatPrice } from '@/lib/api';
import Link from 'next/link';
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, Search } from 'lucide-react';

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    'pending': { label: 'Chờ xác nhận', color: 'text-yellow-500', icon: Clock },
    'processing': { label: 'Đang xử lý', color: 'text-blue-500', icon: Package },
    'shipped': { label: 'Đang giao hàng', color: 'text-purple-500', icon: Truck },
    'delivered': { label: 'Đã giao hàng', color: 'text-green-500', icon: CheckCircle2 },
    'cancelled': { label: 'Đã hủy', color: 'text-red-500', icon: XCircle },
};

export default function OrdersPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUserOrders(token).then(data => {
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
                <span className="text-white">Lịch sử đơn hàng</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-12">
                Đơn <span className="text-[#e60012]">Hàng</span>
            </h1>

            {orders.length === 0 ? (
                <div className="bg-[#111] border border-[#2a2a2a] p-12 text-center">
                    <Package size={48} className="text-gray-600 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-500 uppercase font-bold tracking-widest text-sm mb-6">Bạn chưa có đơn hàng nào</p>
                    <Link href="/products" className="btn-street inline-block px-10">Bắt đầu mua sắm</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const StatusIcon = statusMap[order.status]?.icon || Clock;
                        return (
                            <div key={order.id} className="bg-[#111] border border-[#2a2a2a] p-6 group hover:border-[#444] transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mã đơn hàng</p>
                                        <p className="text-white font-mono font-bold uppercase text-lg">{order.id.split('-')[0]}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ngày đặt</p>
                                        <p className="text-white font-bold">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tổng tiền</p>
                                        <p className="text-[#e60012] font-black italic text-xl">{formatPrice(Number(order.total_amount))}</p>
                                    </div>

                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-none">
                                        <StatusIcon size={16} className={statusMap[order.status]?.color} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${statusMap[order.status]?.color}`}>
                                            {statusMap[order.status]?.label}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/orders/${order.id}`}
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
