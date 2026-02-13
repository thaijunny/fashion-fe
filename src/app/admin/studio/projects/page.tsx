'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllProjectsAdmin, fetchOrderedProjectsAdmin, getImageUrl } from '@/lib/api';
import {
    Calendar,
    User,
    ShoppingBag,
    Eye,
    Search,
    Filter,
    CheckCircle2,
    Clock
} from 'lucide-react';
import Link from 'next/link';

export default function AdminProjectsPage() {
    const { token } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'ordered'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadProjects = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const data = filterType === 'all'
                    ? await fetchAllProjectsAdmin(token)
                    : await fetchOrderedProjectsAdmin(token);
                setProjects(data);
            } catch (error) {
                console.error('Error fetching admin projects:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, [token, filterType]);

    const filteredProjects = projects.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Thiết kế người dùng</h1>
                    <p className="text-gray-500 mt-1">Quản lý và giám sát tất cả các dự án sáng tạo từ khách hàng</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'all'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilterType('ordered')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'ordered'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Đã đặt hàng
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên dự án, khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dự án</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm gốc</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tạo</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy dự án nào
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                    <img
                                                        src={project.preview_url || '/images/placeholder.png'}
                                                        alt={project.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{project.name || 'Thiết kế không tên'}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black">{project.id.split('-')[0]}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                    {project.user?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{project.user?.full_name}</p>
                                                    <p className="text-xs text-gray-500">{project.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {project.product?.name || 'Sản phẩm gốc'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar size={14} />
                                                {new Date(project.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/studio?projectId=${project.id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all uppercase italic shadow-sm"
                                            >
                                                <Eye size={12} />
                                                Xem & Sửa
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <p>Hiển thị {filteredProjects.length} dự án</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>Tất cả dự án đã lưu</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span>Đã tích hợp đơn hàng</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
