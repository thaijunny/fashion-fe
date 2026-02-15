'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllProjectsAdmin, fetchProjectByIdAdmin, getImageUrl } from '@/lib/api';
import {
    Calendar,
    User,
    Eye,
    Search,
    CheckCircle2,
    Clock,
    X,
} from 'lucide-react';

export default function AdminProjectsPage() {
    const { token } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Preview modal state
    const [previewProject, setPreviewProject] = useState<any>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const openPreview = async (project: any) => {
        if (!token) return;
        setLoadingPreview(true);
        try {
            const full = await fetchProjectByIdAdmin(project.id, token);
            setPreviewProject(full || project);
        } catch {
            setPreviewProject(project);
        } finally {
            setLoadingPreview(false);
        }
    };

    useEffect(() => {
        const loadProjects = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const data = await fetchAllProjectsAdmin(token);
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

    const downloadImage = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.click();
    };



    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Thiết kế người dùng</h1>
                    <p className="text-gray-500 mt-1">Quản lý và giám sát tất cả các dự án sáng tạo từ khách hàng</p>
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
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Phôi / Màu / Size</th>
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
                                                        src={project.preview_front || '/images/placeholder_project.png'}
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
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">{project.design_data?.templateName || '—'}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {project.garment_color && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                            <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: project.garment_color === 'black' ? '#1a1a1a' : project.garment_color }}></span>
                                                            {project.garment_color}
                                                        </span>
                                                    )}
                                                    {project.garment_size && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{project.garment_size}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar size={14} />
                                                {new Date(project.created_at).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openPreview(project)}
                                                    disabled={loadingPreview}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                                                    title="Xem thiết kế"
                                                >
                                                    <Eye size={12} />
                                                    Preview
                                                </button>

                                            </div>
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

            {/* Preview Modal */}
            {previewProject && (() => {
                const template = previewProject.garment_template;
                const designData = previewProject.design_data;
                const frontElements = designData?.front || [];
                const backElements = designData?.back || [];
                const frontDA = template?.front_design_area || { left: 25, top: 20, right: 25, bottom: 30 };
                const backDA = template?.back_design_area || { left: 25, top: 15, right: 25, bottom: 25 };
                const garmentColor = previewProject.garment_color;

                const renderDesignOverlay = (elements: any[], designArea: any) => (
                    <div
                        className="absolute"
                        style={{
                            left: designArea.left + '%',
                            top: designArea.top + '%',
                            width: (100 - designArea.left - designArea.right) + '%',
                            height: (100 - designArea.top - designArea.bottom) + '%',
                        }}
                    >
                        {elements.map((el: any) => {
                            const dW = (template?.width || 400) * (100 - designArea.left - designArea.right) / 100;
                            const dH = (template?.height || 500) * (100 - designArea.top - designArea.bottom) / 100;
                            return (
                                <div
                                    key={el.id}
                                    className="absolute"
                                    style={{
                                        left: `${(el.x / dW) * 100}%`,
                                        top: `${(el.y / dH) * 100}%`,
                                        width: `${(el.width / dW) * 100}%`,
                                        height: `${(el.height / dH) * 100}%`,
                                        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                                        opacity: (el.opacity ?? 100) / 100,
                                    }}
                                >
                                    {el.type === 'text' && (
                                        <div
                                            className="w-full h-full flex items-center"
                                            style={{
                                                color: el.color,
                                                fontSize: 'inherit',
                                                fontWeight: el.fontWeight,
                                                fontFamily: el.fontFamily,
                                                textAlign: el.textAlign || 'center',
                                                justifyContent: el.textAlign === 'left' ? 'flex-start' :
                                                    el.textAlign === 'right' ? 'flex-end' : 'center',
                                                backgroundColor: el.textBgColor,
                                            }}
                                        >
                                            {el.content}
                                        </div>
                                    )}
                                    {el.type === 'shape' && (
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                backgroundColor: el.color,
                                                borderRadius: el.content === 'circle' ? '50%' : '0',
                                                clipPath: el.content === 'triangle'
                                                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                                    : undefined,
                                            }}
                                        />
                                    )}
                                    {el.type === 'sticker' && (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            {(el.content.startsWith('/') || el.content.startsWith('http'))
                                                ? <img src={getImageUrl(el.content)} alt="" className="w-full h-full object-contain" />
                                                : el.content}
                                        </div>
                                    )}
                                    {el.type === 'image' && (
                                        <img
                                            src={getImageUrl(el.content)}
                                            alt="Uploaded"
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreviewProject(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">{previewProject.name || 'Thiết kế không tên'}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Bởi {previewProject.user?.full_name} • {previewProject.garment_color} • {previewProject.garment_size}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPreviewProject(null)}
                                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-6">
                                {/* Front Side */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Mặt Trước</h3>
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center min-h-[300px]">
                                        {template?.front_image ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={getImageUrl(template.front_image)}
                                                    alt="Front"
                                                    className="max-h-[400px] object-contain"
                                                    style={{
                                                        filter: garmentColor === 'black'
                                                            ? 'invert(1) grayscale(1) brightness(0.15)'
                                                            : 'none'
                                                    }}
                                                />
                                                {renderDesignOverlay(frontElements, frontDA)}
                                            </div>
                                        ) : previewProject.preview_front ? (
                                            <img src={previewProject.preview_front} alt="Front" className="max-h-[400px] object-contain" />
                                        ) : (
                                            <p className="text-gray-400 text-sm">Không có preview</p>
                                        )}
                                    </div>
                                </div>
                                {/* Back Side */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Mặt Sau</h3>
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center min-h-[300px]">
                                        {template?.back_image ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={getImageUrl(template.back_image)}
                                                    alt="Back"
                                                    className="max-h-[400px] object-contain"
                                                    style={{
                                                        filter: garmentColor === 'black'
                                                            ? 'invert(1) grayscale(1) brightness(0.15)'
                                                            : 'none'
                                                    }}
                                                />
                                                {renderDesignOverlay(backElements, backDA)}
                                            </div>
                                        ) : previewProject.preview_back ? (
                                            <img src={previewProject.preview_back} alt="Back" className="max-h-[400px] object-contain" />
                                        ) : (
                                            <p className="text-gray-400 text-sm">Không có preview</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
