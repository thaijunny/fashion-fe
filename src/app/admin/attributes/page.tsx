'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    SlidersHorizontal,
    Palette,
    Layers,
    Maximize,
    X,
    Check
} from 'lucide-react';
import {
    fetchSizes, createSize, updateSize, deleteSize,
    fetchColors, createColor, updateColor, deleteColor,
    fetchMaterials, createMaterial, updateMaterial, deleteMaterial
} from '@/lib/api';
import { Size, Color, MaterialType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/ui/Toast';

type TabType = 'sizes' | 'colors' | 'materials';

export default function AdminAttributesPage() {
    const [activeTab, setActiveTab] = useState<TabType>('sizes');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({ name: '', hex_code: '' });
    const [saving, setSaving] = useState(false);
    const { token } = useAuth();
    const { showToast } = useToast();

    // Delete confirm state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
    const [deleting, setDeleting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            let data: any[] = [];
            if (activeTab === 'sizes') data = await fetchSizes();
            else if (activeTab === 'colors') data = await fetchColors();
            else if (activeTab === 'materials') data = await fetchMaterials();
            setItems(data);
        } catch (error) {
            console.error('Error loading attributes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ ...item });
        } else {
            setEditingItem(null);
            setFormData({ name: '', hex_code: activeTab === 'colors' ? '#000000' : '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSaving(true);
        try {
            let success = false;
            if (activeTab === 'sizes') {
                if (editingItem) success = !!(await updateSize(editingItem.id, formData, token));
                else success = !!(await createSize(formData, token));
            } else if (activeTab === 'colors') {
                if (editingItem) success = !!(await updateColor(editingItem.id, formData, token));
                else success = !!(await createColor(formData, token));
            } else if (activeTab === 'materials') {
                if (editingItem) success = !!(await updateMaterial(editingItem.id, formData, token));
                else success = !!(await createMaterial(formData, token));
            }

            if (success) {
                setIsModalOpen(false);
                loadData();
            }
        } catch (error) {
            console.error('Error saving attribute:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const confirmDelete = async () => {
        if (!token || !deleteModal.id) return;
        setDeleting(true);
        try {
            let success = false;
            if (activeTab === 'sizes') success = await deleteSize(deleteModal.id, token);
            else if (activeTab === 'colors') success = await deleteColor(deleteModal.id, token);
            else if (activeTab === 'materials') success = await deleteMaterial(deleteModal.id, token);

            if (success) {
                showToast('Xóa thành công!');
                loadData();
            } else {
                showToast('Xóa thất bại', 'error');
            }
        } catch (error) {
            console.error('Error deleting attribute:', error);
            showToast('Lỗi khi xóa', 'error');
        } finally {
            setDeleting(false);
            setDeleteModal({ isOpen: false, id: '', name: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Thuộc tính</h1>
                    <p className="text-gray-500 mt-1">Quản lý Sizes, Màu sắc và Chất liệu của sản phẩm</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-md shadow-indigo-200"
                >
                    <Plus size={20} />
                    <span>Thêm {activeTab === 'sizes' ? 'Size' : activeTab === 'colors' ? 'Màu' : 'Chất liệu'}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('sizes')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'sizes'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Maximize size={16} />
                    Sizes
                </button>
                <button
                    onClick={() => setActiveTab('colors')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'colors'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Palette size={16} />
                    Màu sắc
                </button>
                <button
                    onClick={() => setActiveTab('materials')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${activeTab === 'materials'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <Layers size={16} />
                    Chất liệu
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-sm">
                        <input
                            type="text"
                            placeholder={`Tìm kiếm ${activeTab === 'sizes' ? 'size' : activeTab === 'colors' ? 'màu' : 'chất liệu'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tên {activeTab === 'sizes' ? 'Size' : activeTab === 'colors' ? 'Màu' : 'Chất liệu'}</th>
                                {activeTab === 'colors' && (
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã màu</th>
                                )}
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'colors' ? 3 : 2} className="px-6 py-8 text-center">
                                        <div className="flex justify-center flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-gray-500 text-sm">Đang tải...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {activeTab === 'colors' && (
                                                    <div
                                                        className="w-6 h-6 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: item.hex_code }}
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900">{item.name}</span>
                                            </div>
                                        </td>
                                        {activeTab === 'colors' && (
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono uppercase">
                                                {item.hex_code}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.id, item.name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={activeTab === 'colors' ? 3 : 2} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <SlidersHorizontal className="text-gray-200" size={48} />
                                            <p className="text-gray-500">Không tìm thấy dữ liệu</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setIsModalOpen(false)} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingItem ? 'Sửa' : 'Thêm'} {activeTab === 'sizes' ? 'Size' : activeTab === 'colors' ? 'Màu' : 'Chất liệu'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    Tên {activeTab === 'sizes' ? 'Size' : activeTab === 'colors' ? 'Màu' : 'Chất liệu'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder={activeTab === 'sizes' ? 'VD: M, L, XL...' : activeTab === 'colors' ? 'VD: Đen, Trắng...' : 'VD: Cotton, Silk...'}
                                />
                            </div>

                            {activeTab === 'colors' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                        Mã màu (Hex Code)
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                required
                                                value={formData.hex_code}
                                                onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                                                className="w-full px-4 py-2 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono uppercase"
                                                placeholder="#000000"
                                            />
                                            <div
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-200 pointer-events-none"
                                                style={{ backgroundColor: formData.hex_code || '#000000' }}
                                            />
                                        </div>
                                        <input
                                            type="color"
                                            value={formData.hex_code || '#000000'}
                                            onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                                            className="w-12 h-10 p-1 border border-gray-200 rounded-lg cursor-pointer bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-all"
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-md shadow-indigo-200 flex items-center justify-center"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={20} className="mr-2" />
                                            <span>Lưu thay đổi</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title={`Xóa ${activeTab === 'sizes' ? 'Size' : activeTab === 'colors' ? 'Màu' : 'Chất liệu'}`}
                message={`Bạn có chắc chắn muốn xóa "${deleteModal.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa mục"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
                type="danger"
                isLoading={deleting}
            />
        </div>
    );
}
