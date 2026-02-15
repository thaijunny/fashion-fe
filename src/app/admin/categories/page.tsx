'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
    fetchCategories, createCategory, updateCategory, deleteCategory,
    uploadFile, getImageUrl
} from '@/lib/api';
import {
    Plus, Trash2, Edit2, Search, X, Save, Upload, ImageIcon, FolderOpen, Package
} from 'lucide-react';

export default function AdminCategoriesPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal/Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({ name: '', slug: '', image: '', size_guide_image: '' });
    const [isSaving, setIsSaving] = useState(false);

    // File uploads
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [selectedGuideFile, setSelectedGuideFile] = useState<File | null>(null);
    const [guidePreview, setGuidePreview] = useState('');
    const imageInputRef = useRef<HTMLInputElement>(null);
    const guideInputRef = useRef<HTMLInputElement>(null);

    // Delete
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const loadCategories = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch {
            showToast('Không thể tải danh mục', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCategories(); }, [token]);

    const autoSlug = (name: string) => {
        return name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleOpenModal = (item: any = null) => {
        setEditingItem(item);
        setSelectedImageFile(null); setImagePreview('');
        setSelectedGuideFile(null); setGuidePreview('');
        if (item) {
            setFormData({ name: item.name, slug: item.slug, image: item.image || '', size_guide_image: item.size_guide_image || '' });
            if (item.image) setImagePreview(getImageUrl(item.image));
            if (item.size_guide_image) setGuidePreview(getImageUrl(item.size_guide_image));
        } else {
            setFormData({ name: '', slug: '', image: '', size_guide_image: '' });
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'guide') => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (target === 'image') {
            setSelectedImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setSelectedGuideFile(file);
            setGuidePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setIsSaving(true);
        try {
            let data = { ...formData };

            if (selectedImageFile) {
                const url = await uploadFile(selectedImageFile, token);
                if (!url) { showToast('Upload ảnh thất bại', 'error'); setIsSaving(false); return; }
                data.image = url;
            }
            if (selectedGuideFile) {
                const url = await uploadFile(selectedGuideFile, token);
                if (!url) { showToast('Upload size guide thất bại', 'error'); setIsSaving(false); return; }
                data.size_guide_image = url;
            }

            if (editingItem) {
                await updateCategory(editingItem.id, data, token);
            } else {
                await createCategory(data, token);
            }
            setIsModalOpen(false);
            showToast(editingItem ? 'Cập nhật thành công!' : 'Thêm danh mục thành công!');
            loadCategories();
        } catch {
            showToast('Lưu thất bại', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !deleteConfirm.id) return;
        setIsDeleting(true);
        try {
            await deleteCategory(deleteConfirm.id, token);
            showToast('Đã xóa danh mục!');
            loadCategories();
        } catch {
            showToast('Xóa thất bại', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteConfirm({ isOpen: false, id: '', name: '' });
        }
    };

    const filtered = categories.filter(c =>
        !searchTerm || c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.slug?.includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Danh Mục</h1>
                    <p className="text-gray-500 mt-1">Quản lý danh mục sản phẩm</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    <Plus size={18} /> Thêm danh mục
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Tìm danh mục..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Chưa có danh mục nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ảnh</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Slug</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sản phẩm</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Size Guide</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(cat => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                {cat.image ? (
                                                    <img src={getImageUrl(cat.image)} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={18} className="text-gray-300" /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                                                <Package size={12} /> {cat.productCount ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {cat.size_guide_image ? (
                                                <span className="text-green-600 text-xs font-bold">✓ Có</span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Chưa có</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Sửa">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteConfirm({ isOpen: true, id: cat.id, name: cat.name })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900">{editingItem ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                            <input ref={guideInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'guide')} />

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tên danh mục</label>
                                <input type="text" required value={formData.name} onChange={e => {
                                    const name = e.target.value;
                                    setFormData({ ...formData, name, slug: editingItem ? formData.slug : autoSlug(name) });
                                }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="VD: Áo thun" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Slug</label>
                                <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm" placeholder="ao-thun" />
                            </div>

                            {/* Category image */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ảnh danh mục</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl border border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-50"
                                        onClick={() => imageInputRef.current?.click()}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    {imagePreview && (
                                        <button type="button" onClick={() => { setSelectedImageFile(null); setImagePreview(''); setFormData({ ...formData, image: '' }); }}
                                            className="text-xs text-red-500 hover:text-red-700">Xóa ảnh</button>
                                    )}
                                </div>
                            </div>

                            {/* Size guide image */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ảnh bảng size</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl border border-dashed border-gray-300 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-50"
                                        onClick={() => guideInputRef.current?.click()}>
                                        {guidePreview ? (
                                            <img src={guidePreview} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                    {guidePreview && (
                                        <button type="button" onClick={() => { setSelectedGuideFile(null); setGuidePreview(''); setFormData({ ...formData, size_guide_image: '' }); }}
                                            className="text-xs text-red-500 hover:text-red-700">Xóa size guide</button>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">💡 Ảnh bảng quy đổi size sẽ hiển thị cho người dùng khi chọn size.</p>
                            </div>

                            <button type="submit" disabled={isSaving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> {editingItem ? 'Lưu thay đổi' : 'Thêm danh mục'}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={deleteConfirm.isOpen} title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa danh mục "${deleteConfirm.name}"? Các sản phẩm trong danh mục này sẽ không bị xóa.`}
                confirmText="Xóa" cancelText="Hủy" type="danger" isLoading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
            />
        </div>
    );
}
