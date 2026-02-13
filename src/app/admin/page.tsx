'use client';

import { useAuth } from '@/context/AuthContext';
import {
    Package,
    ShoppingBag,
    Users,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { user } = useAuth();

    const stats = [
        { name: 'Sản phẩm', value: '24', icon: Package, change: '+2', changeType: 'increase', href: '/admin/products' },
        { name: 'Đơn hàng', value: '156', icon: ShoppingBag, change: '+12%', changeType: 'increase', href: '/admin/orders' },
        { name: 'Người dùng', value: '1,240', icon: Users, change: '+18', changeType: 'increase', href: '/admin/users' },
        { name: 'Doanh thu', value: '45.2M', icon: TrendingUp, change: '-4%', changeType: 'decrease', href: '/admin/orders' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Chào mừng trở lại, {user?.full_name}!</h1>
                <p className="text-gray-500 text-sm">Đây là những gì đang diễn ra với cửa hàng của bạn hôm nay.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <stat.icon size={24} />
                            </div>
                            <div className={`flex items-center text-xs font-bold ${stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                {stat.change}
                                {stat.changeType === 'increase' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <Link
                            href={stat.href}
                            className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
                        >
                            Xem chi tiết
                            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">Hoạt động gần đây</h2>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">Xem tất cả</button>
                    </div>
                    <div className="p-6 space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800">
                                        <span className="font-bold">Đơn hàng #3492</span> vừa được tạo bởi <span className="font-bold">Kien Tran</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">2 phút trước</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Tips or Announcements */}
                <div className="bg-indigo-600 rounded-xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-4">Mẹo: Quản lý hàng tồn kho</h2>
                        <p className="text-indigo-100 mb-6 leading-relaxed">
                            Bạn có thể ẩn sản phẩm khỏi cửa hàng nếu chúng hết hàng thay vì xóa chúng.
                            Sử dụng tính năng "Ẩn" trong trang quản lý sản phẩm để thực hiện việc này nhanh chóng.
                        </p>
                        <Link
                            href="/admin/products"
                            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors inline-block"
                        >
                            Thử ngay
                        </Link>
                    </div>
                    <Package className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 rotate-12" />
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
