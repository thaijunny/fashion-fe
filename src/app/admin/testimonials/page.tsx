'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, uploadFile, getImageUrl } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff, Loader2, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
    id: string;
    customer_name: string;
    avatar_url: string;
    content: string;
    rating: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export default function AdminTestimonialsPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        customer_name: '',
        avatar_url: '',
        content: '',
        rating: 5,
        is_active: true,
        sort_order: 0,
    });

    const loadTestimonials = async () => {
        if (!token) return;
        setLoading(true);
        const data = await fetchAllTestimonials(token);
        setTestimonials(data);
        setLoading(false);
    };

    useEffect(() => { loadTestimonials(); }, [token]);

    const openCreate = () => {
        setEditing(null);
        setForm({ customer_name: '', avatar_url: '', content: '', rating: 5, is_active: true, sort_order: 0 });
        setShowModal(true);
    };

    const openEdit = (t: Testimonial) => {
        setEditing(t);
        setForm({
            customer_name: t.customer_name,
            avatar_url: t.avatar_url,
            content: t.content,
            rating: t.rating,
            is_active: t.is_active,
            sort_order: t.sort_order,
        });
        setShowModal(true);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;
        setUploading(true);
        try {
            const url = await uploadFile(file, token, 'products');
            if (url) {
                setForm(f => ({ ...f, avatar_url: url }));
            } else {
                showToast('Upload ảnh thất bại', 'error');
            }
        } catch {
            showToast('Upload ảnh thất bại', 'error');
        }
        setUploading(false);
    };

    const handleSave = async () => {
        if (!token || !form.customer_name || !form.content) {
            showToast('Vui lòng nhập tên và nội dung', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await updateTestimonial(editing.id, form, token);
                showToast('Cập nhật nhận xét thành công!');
            } else {
                await createTestimonial(form, token);
                showToast('Tạo nhận xét thành công!');
            }
            setShowModal(false);
            loadTestimonials();
        } catch {
            showToast('Thao tác thất bại', 'error');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm('Bạn có chắc chắn muốn xóa nhận xét này?')) return;
        try {
            await deleteTestimonial(id, token);
            showToast('Đã xóa nhận xét');
            loadTestimonials();
        } catch {
            showToast('Xóa thất bại', 'error');
        }
    };

    const toggleActive = async (t: Testimonial) => {
        if (!token) return;
        try {
            await updateTestimonial(t.id, { is_active: !t.is_active }, token);
            loadTestimonials();
        } catch {
            showToast('Cập nhật thất bại', 'error');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhận xét khách hàng</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý nhận xét hiển thị trên trang chủ</p>
                </div>
                <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium">
                    <Plus size={18} /> Thêm nhận xét
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            ) : testimonials.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-400 text-lg">Chưa có nhận xét nào</p>
                    <button onClick={openCreate} className="mt-4 text-indigo-600 hover:underline font-medium">Tạo nhận xét đầu tiên</button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {testimonials.map(t => (
                        <div key={t.id} className={`bg-white rounded-xl border p-6 flex gap-5 items-start transition-all ${t.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                                {t.avatar_url ? (
                                    <img src={getImageUrl(t.avatar_url)} alt={t.customer_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                        {t.customer_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-gray-900">{t.customer_name}</h3>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={14} className={s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                    {!t.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Ẩn</span>}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{t.content}</p>
                                <p className="text-gray-400 text-xs mt-2">Thứ tự: {t.sort_order}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => toggleActive(t)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title={t.is_active ? 'Ẩn' : 'Hiện'}>
                                    {t.is_active ? <Eye size={18} className="text-green-600" /> : <EyeOff size={18} className="text-gray-400" />}
                                </button>
                                <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Edit2 size={18} className="text-indigo-600" />
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                                    <Trash2 size={18} className="text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Sửa nhận xét' : 'Thêm nhận xét'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>

                        <div className="space-y-5">
                            {/* Avatar */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Ảnh đại diện</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                                        {form.avatar_url ? (
                                            <img src={getImageUrl(form.avatar_url)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Upload size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                                        {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Chọn ảnh'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Tên khách hàng *</label>
                                <input
                                    value={form.customer_name}
                                    onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Nội dung nhận xét *</label>
                                <textarea
                                    value={form.content}
                                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                                    placeholder="Sản phẩm rất đẹp, chất lượng tốt..."
                                />
                            </div>

                            {/* Rating + Sort */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Đánh giá</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}>
                                                <Star size={24} className={s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-2">Thứ tự hiển thị</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Active */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Hiển thị trên trang chủ</span>
                            </label>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                                {editing ? 'Cập nhật' : 'Tạo mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
