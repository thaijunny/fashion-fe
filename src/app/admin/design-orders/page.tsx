'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllDesignOrdersAdmin, updateDesignOrderStatusAdmin, downloadDesignOrderZip, formatPrice, getImageUrl } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
    Search, Eye, Download, ChevronDown, Clock, CheckCircle2, Printer, Truck, XCircle, Palette, Package
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

const statusOptions = [
    { value: 'pending', label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
    { value: 'printing', label: 'Đang in', color: 'bg-purple-100 text-purple-700' },
    { value: 'shipped', label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'done', label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
];

export default function AdminDesignOrdersPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Preview modal
    const [previewOrder, setPreviewOrder] = useState<any>(null);

    // Confirm modal
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; orderId: string; nextStatus: string }>({
        isOpen: false,
        orderId: '',
        nextStatus: ''
    });
    const [updating, setUpdating] = useState(false);

    const loadOrders = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await fetchAllDesignOrdersAdmin(token);
            setOrders(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOrders(); }, [token]);

    const initiateStatusChange = (orderId: string, nextStatus: string) => {
        setConfirmModal({ isOpen: true, orderId, nextStatus });
    };

    const confirmStatusChange = async () => {
        const { orderId, nextStatus } = confirmModal;
        if (!token || !orderId || !nextStatus) return;

        setUpdating(true);
        try {
            await updateDesignOrderStatusAdmin(orderId, nextStatus, token);
            showToast('Cập nhật trạng thái thành công!');
            loadOrders();
        } catch (e: any) {
            showToast(e.message || 'Lỗi cập nhật', 'error');
        } finally {
            setUpdating(false);
            setConfirmModal({ isOpen: false, orderId: '', nextStatus: '' });
        }
    };

    const handleDownload = async (orderId: string) => {
        if (!token) return;
        try {
            await downloadDesignOrderZip(orderId, token);
            showToast('Đã tải bản in!');
        } catch (e: any) {
            showToast(e.message || 'Lỗi tải xuống', 'error');
        }
    };

    const filtered = orders.filter(o => {
        const matchSearch = !searchTerm ||
            o.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id.includes(searchTerm);
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Đơn Thiết Kế</h1>
                <p className="text-gray-500 mt-1">Quản lý đơn đặt hàng từ Design Studio</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên dự án, khách hàng..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {statusOptions.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                    <div className="text-sm text-gray-500 font-bold">
                        {filtered.length} đơn hàng
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Package size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Chưa có đơn thiết kế nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dự án / Khách</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chi tiết</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tổng tiền</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày</th>
                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(order => {
                                    const st = statusOptions.find(s => s.value === order.status) || statusOptions[0];
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    {order.project?.preview_front ? (
                                                        <img
                                                            src={order.project.preview_front.startsWith('data:') ? order.project.preview_front : getImageUrl(order.project.preview_front)}
                                                            alt="" className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Palette size={18} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{order.project?.name || 'Thiết kế'}</p>
                                                <p className="text-xs text-gray-500">{order.user?.full_name || order.user?.email || '—'}</p>
                                                <p className="text-xs text-gray-400">{order.full_name} · {order.phone_number}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <p>{order.garment_template?.name || 'Phôi'}</p>
                                                <p className="text-xs">Size: {order.garment_size} · Màu: {order.garment_color} · SL: {order.quantity}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {formatPrice(Number(order.total_amount))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={e => initiateStatusChange(order.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer ${st.color}`}
                                                >
                                                    {statusOptions.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setPreviewOrder(order)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Xem thiết kế"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(order.id)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Tải bản in (ZIP)"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-gray-900">
                                Thiết kế: {previewOrder.project?.name || 'N/A'}
                            </h3>
                            <button onClick={() => setPreviewOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <XCircle size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Mặt trước</p>
                                    <div className="aspect-[3/4] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                        {previewOrder.project?.preview_front ? (
                                            <img src={previewOrder.project.preview_front.startsWith('data:') ? previewOrder.project.preview_front : getImageUrl(previewOrder.project.preview_front)} alt="Front" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">Chưa có</div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Mặt sau</p>
                                    <div className="aspect-[3/4] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                        {previewOrder.project?.preview_back ? (
                                            <img src={previewOrder.project.preview_back.startsWith('data:') ? previewOrder.project.preview_back : getImageUrl(previewOrder.project.preview_back)} alt="Back" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">Chưa có</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Thông tin đơn</p>
                                    <p>Phôi: <strong>{previewOrder.garment_template?.name || 'N/A'}</strong></p>
                                    <p>Size: <strong>{previewOrder.garment_size}</strong> · Màu: <strong>{previewOrder.garment_color}</strong></p>
                                    <p>Số lượng: <strong>{previewOrder.quantity}</strong></p>
                                    <p className="mt-2 text-lg font-bold text-indigo-600">{formatPrice(Number(previewOrder.total_amount))}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Giao hàng</p>
                                    <p className="font-bold">{previewOrder.full_name || '—'}</p>
                                    <p>{previewOrder.phone_number || '—'}</p>
                                    <p className="text-gray-500">{previewOrder.shipping_address || '—'}</p>
                                    {previewOrder.note && <p className="mt-1 text-gray-400 italic">{previewOrder.note}</p>}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleDownload(previewOrder.id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                                >
                                    <Download size={18} />
                                    Tải bản in (ZIP)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Thay đổi trạng thái?"
                message={confirmModal.nextStatus ? `Bạn có chắc chắn muốn chuyển đơn thiết kế sang trạng thái "${statusOptions.find(s => s.value === confirmModal.nextStatus)?.label}"?` : ''}
                onConfirm={confirmStatusChange}
                onCancel={() => setConfirmModal({ isOpen: false, orderId: '', nextStatus: '' })}
                isLoading={updating}
                type="info"
            />
        </div>
    );
}
