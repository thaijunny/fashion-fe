'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
    SlidersHorizontal,
    Palette,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Sản phẩm', icon: Package, href: '/admin/products' },
        { name: 'Đơn hàng', icon: ShoppingBag, href: '/admin/orders' },
        { name: 'Thuộc tính', icon: SlidersHorizontal, href: '/admin/attributes' },
        { name: 'Người dùng', icon: Users, href: '/admin/users' },
        { name: 'Thiết kế người dùng', icon: Sparkles, href: '/admin/studio/projects' },
        { name: 'Quản lý Studio', icon: Palette, href: '/admin/studio/assets' },
        { name: 'Cài đặt', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex text-gray-900">
            {/* Sidebar */}
            <aside
                className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold text-gray-800 tracking-tight">
                            ADMIN <span className="text-indigo-600">PANEL</span>
                        </span>
                    ) : (
                        <span className="text-xl font-bold text-indigo-600 mx-auto">A</span>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-500'} />
                                {isSidebarOpen && <span>{item.name}</span>}
                                {isActive && isSidebarOpen && <ChevronRight size={14} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-800">{user.full_name}</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{user.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                            {user.full_name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                <div className="p-8 pb-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
