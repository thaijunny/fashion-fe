'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllOrdersAdmin, updateOrderStatus, formatPrice } from '@/lib/api';
import {
    Package,
    Search,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    Eye,
    AlertCircle,
    ChevronRight,
    Filter
} from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

const statusMap: Record<string, { label: string, color: string, icon: any, bgColor: string }> = {
    'pending': { label: 'Chờ xác nhận', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
    'processing': { label: 'Đang xử lý', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Package },
    'shipped': { label: 'Đang giao hàng', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Truck },
    'delivered': { label: 'Đã giao hàng', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CheckCircle2 },
    'cancelled': { label: 'Đã hủy', color: 'text-rose-600', bgColor: 'bg-rose-50', icon: XCircle },
};

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; orderId: string | null; currentStatus: string | null; nextStatus: string | null }>({
        isOpen: false,
        orderId: null,
        currentStatus: null,
        nextStatus: null
    });

    const loadOrders = async () => {
        if (!token) return;
        setLoading(true);
        const data = await fetchAllOrdersAdmin(token);
        setOrders(data);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, [token]);

    const handleStatusUpdate = async () => {
        const { orderId, nextStatus } = confirmModal;
        if (!token || !orderId || !nextStatus) return;

        setIsUpdating(orderId);
        try {
            const success = await updateOrderStatus(orderId, nextStatus, token);
            if (success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
            } else {
                alert('Cập nhật trạng thái thất bại. Vui lòng kiểm tra lại logic chuyển đổi.');
            }
        } catch (error) {
            console.error('Update failed', error);
        } finally {
            setIsUpdating(null);
            setConfirmModal({ isOpen: false, orderId: null, currentStatus: null, nextStatus: null });
        }
    };

    const initiateStatusUpdate = (orderId: string, currentStatus: string, nextStatus: string) => {
        // Terminal states check
        if (['delivered', 'cancelled'].includes(currentStatus)) {
            return;
        }

        // Processing to Pending check
        if (currentStatus === 'processing' && nextStatus === 'pending') {
            return;
        }

        setConfirmModal({
            isOpen: true,
            orderId,
            currentStatus,
            nextStatus
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.phone_number?.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Đơn hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Sắp xếp, theo dõi và cập nhật trạng thái đơn hàng của khách hàng.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${filterStatus === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${filterStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Chờ xác nhận
                        </button>
                        <button
                            onClick={() => setFilterStatus('processing')}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${filterStatus === 'processing' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Đang xử lý
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn, tên hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-11 border-l border-gray-200 hidden md:block"></div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Filter size={16} />
                        <span>Trạng thái:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-gray-900 font-bold cursor-pointer"
                        >
                            <option value="all">Mọi trạng thái</option>
                            {statusOptions.map(s => (
                                <option key={s} value={s}>{statusMap[s].label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đơn hàng</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Thanh toán</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                                const status = statusMap[order.status] || statusMap.pending;
                                const isTerminal = ['delivered', 'cancelled'].includes(order.status);

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-indigo-600 font-mono">#{order.id.split('-')[0].toUpperCase()}</span>
                                                <span className="text-[11px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{order.full_name}</span>
                                                <span className="text-xs text-gray-500">{order.phone_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{formatPrice(Number(order.total_amount))}</span>
                                                <span className="text-[11px] text-gray-400 uppercase font-medium">{order.payment_method}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {isTerminal ? (
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bgColor} ${status.color}`}>
                                                    <status.icon size={14} />
                                                    {status.label}
                                                </div>
                                            ) : (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => initiateStatusUpdate(order.id, order.status, e.target.value)}
                                                    disabled={isUpdating === order.id}
                                                    className={`text-xs font-bold rounded-lg border border-gray-200 px-3 py-1.5 focus:ring-0 focus:border-indigo-600 transition-all cursor-pointer ${status.color} ${status.bgColor} outline-none disabled:opacity-50`}
                                                >
                                                    {statusOptions.map(s => {
                                                        const isProcessingToPending = order.status === 'processing' && s === 'pending';
                                                        // Disable backward logic in dropdown as well
                                                        const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                                        const isBackward = statusOrder.indexOf(s) < statusOrder.indexOf(order.status) && s !== 'cancelled';

                                                        return (
                                                            <option key={s} value={s} disabled={isProcessingToPending || isBackward}>
                                                                {statusMap[s].label}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="inline-flex items-center justify-center w-9 h-9 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <Package size={40} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng nào.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Cập nhật trạng thái?"
                message={confirmModal.nextStatus ? `Chuyển đơn hàng sang trạng thái "${statusMap[confirmModal.nextStatus].label}"?` : ''}
                onConfirm={handleStatusUpdate}
                onCancel={() => setConfirmModal({ isOpen: false, orderId: null, currentStatus: null, nextStatus: null })}
                isLoading={isUpdating !== null}
                type="info"
            />
        </div>
    );
}
