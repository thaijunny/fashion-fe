'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardStats, formatPrice } from '@/lib/api';
import {
    Package,
    ShoppingBag,
    Users,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            if (!token) return;
            try {
                const data = await fetchDashboardStats(token);
                if (data) {
                    setStats(data.stats);
                    setActiveTab(data.recentActivity);
                }
            } catch (error) {
                console.error("Lỗi tải stats:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [token]);

    const statCards = [
        { name: 'Sản phẩm', value: stats?.totalProducts ?? 0, icon: Package, href: '/admin/products', color: 'bg-blue-50 text-blue-600' },
        { name: 'Đơn hàng', value: stats?.totalOrders ?? 0, icon: ShoppingBag, href: '/admin/orders', color: 'bg-emerald-50 text-emerald-600' },
        { name: 'Người dùng', value: stats?.totalUsers ?? 0, icon: Users, href: '/admin/users', color: 'bg-amber-50 text-amber-600' },
        { name: 'Doanh thu', value: formatPrice(stats?.totalRevenue ?? 0), icon: TrendingUp, href: '/admin/orders', color: 'bg-rose-50 text-rose-600' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Đang tải dữ liệu thực tế...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Chào mừng trở lại, {user?.full_name}!</h1>
                <p className="text-gray-500 mt-1 font-medium italic">Đây là những gì đang diễn ra với cửa hàng của bạn hôm nay.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 ${stat.color} rounded-xl shadow-sm transition-transform group-hover:scale-110`}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.name}</h3>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>

                        <Link
                            href={stat.href}
                            className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group/link"
                        >
                            Xem chi tiết
                            <ChevronRight size={10} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>

                        {/* Decorative Gradient Background on hover */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-100/40 transition-colors" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h2 className="font-black text-gray-900 uppercase italic tracking-tight">Hoạt động gần đây</h2>
                        <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">Tất cả đơn hàng</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {activeTab.length === 0 ? (
                            <div className="p-12 text-center">
                                <Clock size={48} className="mx-auto mb-4 text-gray-200" />
                                <p className="text-gray-400 italic">Chưa có hoạt động nào</p>
                            </div>
                        ) : activeTab.map((activity) => (
                            <div key={activity.id} className="p-6 flex gap-4 hover:bg-gray-50/80 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <ShoppingBag size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-sm text-gray-900 font-bold truncate">
                                            {activity.user}
                                        </p>
                                        <span className="text-xs font-black text-indigo-600">
                                            {formatPrice(activity.amount)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium italic">
                                        {activity.action}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            activity.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                activity.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {activity.status}
                                        </span>
                                        <span className="text-[9px] text-gray-400 font-medium">
                                            {new Date(activity.time).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Tips or Announcements */}
                <div className="bg-gray-900 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-gray-200">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <TrendingUp className="text-indigo-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tight">Tối ưu doanh thu</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed font-medium italic max-w-sm">
                            Phân tích cho thấy khách hàng thường quay lại mua sắm sau khi nhận được thông báo về sản phẩm mới.
                            Hãy đảm bảo các bộ sưu tập của bạn luôn được cập nhật.
                        </p>
                        <Link
                            href="/admin/products"
                            className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-gray-100 transition-transform active:scale-95 inline-block shadow-lg"
                        >
                            Quản lý kho hàng
                        </Link>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
                    <Package className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
                </div>
            </div>
        </div>
    );
}

function ChevronRight({ size, className }: { size: number, className: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
