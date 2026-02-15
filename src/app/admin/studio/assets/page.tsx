'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
    fetchStudioColors, createStudioColor, updateStudioColor, deleteStudioColor,
    fetchStudioAssets, createStudioAsset, updateStudioAsset, deleteStudioAsset,
    fetchGarmentTemplates, createGarmentTemplate, updateGarmentTemplate, deleteGarmentTemplate,
    uploadFile, getImageUrl
} from '@/lib/api';
import {
    Plus, Trash2, Edit2, Palette,
    Sticker, Type, Square, Shirt,
    X, Save, Upload, ImageIcon
} from 'lucide-react';

type TabType = 'colors' | 'stickers' | 'icons' | 'shapes' | 'fonts' | 'templates';

export default function AdminStudioAssetsPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('colors');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal/Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    // File upload states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>('');
    const [selectedFrontFile, setSelectedFrontFile] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string>('');
    const [selectedBackFile, setSelectedBackFile] = useState<File | null>(null);
    const [backPreview, setBackPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);

    // Delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { loadItems(); }, [activeTab, token]);

    const loadItems = async () => {
        if (!token) return;
        setLoading(true);
        try {
            let data: any[] = [];
            if (activeTab === 'colors') {
                data = await fetchStudioColors();
            } else if (activeTab === 'templates') {
                data = await fetchGarmentTemplates();
            } else {
                const assetType = activeTab === 'stickers' ? 'sticker' : activeTab === 'icons' ? 'icon' : activeTab === 'shapes' ? 'shape' : 'font';
                data = await fetchStudioAssets(assetType);
            }
            setItems(data);
        } catch {
            showToast('Không thể tải dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetFileStates = () => {
        setSelectedFile(null);
        setFilePreview('');
        setSelectedFrontFile(null);
        setFrontPreview('');
        setSelectedBackFile(null);
        setBackPreview('');
    };

    const handleOpenModal = (item: any = null) => {
        setEditingItem(item);
        resetFileStates();
        if (item) {
            setFormData(activeTab === 'templates' ? { ...item } : { ...item });
            // Show existing images as preview
            if (activeTab === 'templates') {
                if (item.front_image) setFrontPreview(getImageUrl(item.front_image));
                if (item.back_image) setBackPreview(getImageUrl(item.back_image));
            } else if (['stickers', 'icons'].includes(activeTab) && item.url) {
                setFilePreview(getImageUrl(item.url));
            }
        } else {
            if (activeTab === 'colors') {
                setFormData({ name: '', hex_code: '#000000' });
            } else if (activeTab === 'templates') {
                setFormData({
                    name: '', icon: '👕', width: 400, height: 500, base_price: 0,
                    size_prices: { S: 0, M: 0, L: 0, XL: 0, '2XL': 0 },
                    front_image: '', back_image: '',
                    front_design_area: { left: 25, top: 20, right: 25, bottom: 30 },
                    back_design_area: { left: 25, top: 15, right: 25, bottom: 25 },
                });
            } else {
                setFormData({ name: '', url: '', type: '' });
            }
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (!file) return;
        const preview = URL.createObjectURL(file);
        if (target === 'main') {
            setSelectedFile(file);
            setFilePreview(preview);
        } else if (target === 'front') {
            setSelectedFrontFile(file);
            setFrontPreview(preview);
        } else {
            setSelectedBackFile(file);
            setBackPreview(preview);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setIsSaving(true);

        try {
            let submitFormData = { ...formData };

            // Handle file uploads for stickers/icons
            if (['stickers', 'icons'].includes(activeTab)) {
                if (selectedFile) {
                    const url = await uploadFile(selectedFile, token);
                    if (!url) { showToast('Upload ảnh thất bại', 'error'); setIsSaving(false); return; }
                    submitFormData.url = url;
                } else if (!editingItem) {
                    showToast('Vui lòng chọn file ảnh', 'error'); setIsSaving(false); return;
                }
            }

            // Handle file uploads for templates
            if (activeTab === 'templates') {
                if (selectedFrontFile) {
                    const url = await uploadFile(selectedFrontFile, token);
                    if (!url) { showToast('Upload ảnh mặt trước thất bại', 'error'); setIsSaving(false); return; }
                    submitFormData.front_image = url;
                } else if (!editingItem && !submitFormData.front_image) {
                    showToast('Vui lòng chọn ảnh mặt trước', 'error'); setIsSaving(false); return;
                }
                if (selectedBackFile) {
                    const url = await uploadFile(selectedBackFile, token);
                    if (!url) { showToast('Upload ảnh mặt sau thất bại', 'error'); setIsSaving(false); return; }
                    submitFormData.back_image = url;
                } else if (!editingItem && !submitFormData.back_image) {
                    showToast('Vui lòng chọn ảnh mặt sau', 'error'); setIsSaving(false); return;
                }
            }

            // Save the item
            if (activeTab === 'colors') {
                if (editingItem) await updateStudioColor(editingItem.id, submitFormData, token);
                else await createStudioColor(submitFormData, token);
            } else if (activeTab === 'templates') {
                if (editingItem) await updateGarmentTemplate(editingItem.id, submitFormData, token);
                else await createGarmentTemplate(submitFormData, token);
            } else {
                const assetType = activeTab === 'stickers' ? 'sticker' : activeTab === 'icons' ? 'icon' : activeTab === 'shapes' ? 'shape' : 'font';
                const data = { ...submitFormData, type: assetType };
                if (editingItem) await updateStudioAsset(editingItem.id, data, token);
                else await createStudioAsset(data, token);
            }

            setIsModalOpen(false);
            showToast(editingItem ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            loadItems();
        } catch {
            showToast('Lưu thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: string, name: string) => setDeleteConfirm({ isOpen: true, id, name });

    const handleDeleteConfirm = async () => {
        if (!token) return;
        setIsDeleting(true);
        try {
            if (activeTab === 'colors') await deleteStudioColor(deleteConfirm.id, token);
            else if (activeTab === 'templates') await deleteGarmentTemplate(deleteConfirm.id, token);
            else await deleteStudioAsset(deleteConfirm.id, token);
            showToast('Đã xóa thành công!');
            loadItems();
        } catch {
            showToast('Xóa thất bại', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteConfirm({ isOpen: false, id: '', name: '' });
        }
    };

    const renderAssetPreview = (asset: any) => {
        const url = asset.url || '';
        if (activeTab === 'fonts') return <span style={{ fontFamily: url }} className="text-2xl font-bold text-gray-700">Aa Bb</span>;
        if (url.startsWith('/') || url.startsWith('http')) return <img src={getImageUrl(url)} alt={asset.name} className="w-full h-full object-contain p-2" />;
        return <span className="text-4xl">{url || '—'}</span>;
    };

    const renderTemplatePreview = (t: any) => (
        <div className="flex gap-1 w-full h-full p-1">
            {[{ img: t.front_image, label: 'Trước' }, { img: t.back_image, label: 'Sau' }].map((side, i) => (
                <div key={i} className="flex-1 rounded overflow-hidden bg-gray-100 border border-gray-200">
                    {side.img ? <img src={getImageUrl(side.img)} alt={side.label} className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">{side.label}</div>}
                </div>
            ))}
        </div>
    );

    const FileUploadBox = ({ preview, onClear, onClick, label }: { preview: string; onClear: () => void; onClick: () => void; label: string }) => (
        <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
            {preview ? (
                <div className="relative w-full h-40 bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden group cursor-pointer" onClick={onClick}>
                    <img src={preview} alt="" className="w-full h-full object-contain p-2" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all" onClick={onClick}>
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Chọn ảnh từ máy</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (tối đa 5MB)</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Quản lý Studio</h1>
                    <p className="text-gray-500 mt-1">Cấu hình bảng màu, sticker, icon, font chữ và phôi áo cho Design Studio</p>
                </div>
                <button onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 uppercase italic text-sm">
                    <Plus size={20} /> Thêm mới
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl">
                {([
                    { id: 'colors', label: 'Màu sắc', icon: Palette },
                    { id: 'stickers', label: 'Stickers', icon: Sticker },
                    { id: 'icons', label: 'Icons', icon: Sticker },
                    { id: 'shapes', label: 'Shapes', icon: Square },
                    { id: 'fonts', label: 'Fonts', icon: Type },
                    { id: 'templates', label: 'Phôi áo', icon: Shirt },
                ] as const).map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Array(12).fill(0).map((_, i) => <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-xl" />)}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                            <Plus size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Chưa có mục nào</p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${activeTab === 'templates' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'}`}>
                            {activeTab === 'colors' ? items.map((c) => (
                                <div key={c.id} className="group relative bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="aspect-square rounded-xl shadow-inner mb-3 border border-gray-200" style={{ backgroundColor: c.hex_code }} />
                                    <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono uppercase">{c.hex_code}</p>
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(c)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><Edit2 size={12} /></button>
                                        <button onClick={() => handleDeleteClick(c.id, c.name)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            )) : activeTab === 'templates' ? items.map((t) => (
                                <div key={t.id} className="group relative bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="aspect-video rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                                        {renderTemplatePreview(t)}
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{t.icon}</span>
                                        <p className="text-sm font-bold text-gray-900 truncate">{t.name}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-400">{t.width}×{t.height}px</p>
                                    <p className="text-xs font-bold text-green-600 mt-0.5">
                                        {(t.base_price !== undefined && t.base_price !== null) ? `${Number(t.base_price).toLocaleString('vi-VN')}₫` : 'Chưa đặt giá'}
                                    </p>
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(t)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><Edit2 size={12} /></button>
                                        <button onClick={() => handleDeleteClick(t.id, t.name)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            )) : items.map((a) => (
                                <div key={a.id} className="group relative bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="aspect-square rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-3 overflow-hidden">
                                        {renderAssetPreview(a)}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 truncate">{a.name}</p>
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(a)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"><Edit2 size={12} /></button>
                                        <button onClick={() => handleDeleteClick(a.id, a.name)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${activeTab === 'templates' ? 'max-w-2xl' : 'max-w-md'} overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-black text-gray-900 uppercase italic">
                                {editingItem ? 'Cập nhật' : 'Thêm mới'} {activeTab === 'colors' ? 'Màu sắc' : activeTab === 'templates' ? 'Phôi áo' : 'Tài nguyên'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Hidden file inputs */}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'main')} />
                            <input ref={frontInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'front')} />
                            <input ref={backInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'back')} />

                            <div className="space-y-4">
                                {/* Name — always shown */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tên hiển thị</label>
                                    <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        placeholder="VD: Đỏ Urban, Sticker Cool..." />
                                </div>

                                {/* Colors */}
                                {activeTab === 'colors' && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Mã màu (Hex)</label>
                                        <div className="flex gap-3">
                                            <input type="color" value={formData.hex_code || '#000000'} onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                                                className="w-12 h-12 rounded-xl border-none p-0 cursor-pointer overflow-hidden shadow-sm" />
                                            <input type="text" required value={formData.hex_code || ''} onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })}
                                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono uppercase" placeholder="#FFFFFF" />
                                        </div>
                                    </div>
                                )}

                                {/* Stickers / Icons — FILE UPLOAD */}
                                {['stickers', 'icons'].includes(activeTab) && (
                                    <FileUploadBox
                                        label={activeTab === 'stickers' ? 'Ảnh sticker' : 'Ảnh icon'}
                                        preview={filePreview}
                                        onClear={() => { setSelectedFile(null); setFilePreview(''); }}
                                        onClick={() => fileInputRef.current?.click()}
                                    />
                                )}

                                {/* Shapes — text input (rect, circle, triangle) */}
                                {activeTab === 'shapes' && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Loại shape</label>
                                        <input type="text" required value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="rect / circle / triangle" />
                                    </div>
                                )}

                                {/* Fonts — text input (Google Font name) */}
                                {activeTab === 'fonts' && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tên Google Font</label>
                                        <input type="text" required value={formData.url || ''} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Roboto, Montserrat..." />
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            💡 Tìm font tại <a href="https://fonts.google.com" target="_blank" className="text-indigo-500 underline">Google Fonts</a>
                                        </p>
                                    </div>
                                )}

                                {/* Templates — FILE UPLOAD for front/back + settings */}
                                {activeTab === 'templates' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Icon</label>
                                                <input type="text" value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl" placeholder="👕" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">W</label>
                                                    <input type="number" value={formData.width || 400} onChange={(e) => setFormData({ ...formData, width: +e.target.value })}
                                                        className="w-full px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">H</label>
                                                    <input type="number" value={formData.height || 500} onChange={(e) => setFormData({ ...formData, height: +e.target.value })}
                                                        className="w-full px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Giá phôi cơ bản (VNĐ)</label>
                                            <input type="number" value={formData.base_price || 0} onChange={(e) => setFormData({ ...formData, base_price: +e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-indigo-600" placeholder="0" />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Giá theo size (VNĐ)</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {Object.keys(formData.size_prices || {}).map(size => (
                                                    <div key={size} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                                                        <span className="text-[9px] font-bold text-gray-500 w-8 text-center">{size}</span>
                                                        <input type="number" value={formData.size_prices?.[size] ?? 0}
                                                            onChange={(e) => setFormData({ ...formData, size_prices: { ...formData.size_prices, [size]: +e.target.value } })}
                                                            className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-center text-sm" placeholder="0" />
                                                        <button type="button" onClick={() => {
                                                            const newPrices = { ...formData.size_prices };
                                                            delete newPrices[size];
                                                            setFormData({ ...formData, size_prices: newPrices });
                                                        }} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="text" id="newSizeInput" placeholder="VD: XXL"
                                                    className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            const val = input.value.trim().toUpperCase();
                                                            if (val && !(formData.size_prices || {})[val]) {
                                                                setFormData({ ...formData, size_prices: { ...formData.size_prices, [val]: formData.base_price || 0 } });
                                                                input.value = '';
                                                            }
                                                        }
                                                    }} />
                                                <button type="button" onClick={() => {
                                                    const input = document.getElementById('newSizeInput') as HTMLInputElement;
                                                    const val = input?.value?.trim().toUpperCase();
                                                    if (val && !(formData.size_prices || {})[val]) {
                                                        setFormData({ ...formData, size_prices: { ...formData.size_prices, [val]: formData.base_price || 0 } });
                                                        if (input) input.value = '';
                                                    }
                                                }} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1">
                                                    <Plus size={14} /> Thêm size
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">💡 Nhập tên size rồi nhấn Enter hoặc "Thêm size" để thêm.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FileUploadBox
                                                label="Ảnh mặt trước"
                                                preview={frontPreview}
                                                onClear={() => { setSelectedFrontFile(null); setFrontPreview(''); setFormData({ ...formData, front_image: '' }); }}
                                                onClick={() => frontInputRef.current?.click()}
                                            />
                                            <FileUploadBox
                                                label="Ảnh mặt sau"
                                                preview={backPreview}
                                                onClear={() => { setSelectedBackFile(null); setBackPreview(''); setFormData({ ...formData, back_image: '' }); }}
                                                onClick={() => backInputRef.current?.click()}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Vùng in mặt trước (% từ cạnh)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {(['left', 'top', 'right', 'bottom'] as const).map(k => (
                                                    <div key={k}>
                                                        <label className="text-[9px] text-gray-400 block text-center mb-1">{k === 'left' ? 'Trái' : k === 'top' ? 'Trên' : k === 'right' ? 'Phải' : 'Dưới'}</label>
                                                        <input type="number" value={formData.front_design_area?.[k] ?? 25}
                                                            onChange={(e) => setFormData({ ...formData, front_design_area: { ...formData.front_design_area, [k]: +e.target.value } })}
                                                            className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Vùng in mặt sau (% từ cạnh)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {(['left', 'top', 'right', 'bottom'] as const).map(k => (
                                                    <div key={k}>
                                                        <label className="text-[9px] text-gray-400 block text-center mb-1">{k === 'left' ? 'Trái' : k === 'top' ? 'Trên' : k === 'right' ? 'Phải' : 'Dưới'}</label>
                                                        <input type="number" value={formData.back_design_area?.[k] ?? 25}
                                                            onChange={(e) => setFormData({ ...formData, back_design_area: { ...formData.back_design_area, [k]: +e.target.value } })}
                                                            className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button type="submit" disabled={isSaving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> {editingItem ? 'Lưu thay đổi' : 'Xác nhận thêm'}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa "${deleteConfirm.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa" cancelText="Hủy"
                type="danger" isLoading={isDeleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
            />
        </div>
    );
}
