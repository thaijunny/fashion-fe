'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchOrderById, updateOrderStatus, formatPrice, getImageUrl } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronLeft,
    Package,
    MapPin,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    User,
    Phone,
    CreditCard,
    Calendar,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

const statusMap: Record<string, { label: string, color: string, bgColor: string, icon: any }> = {
    'pending': { label: 'Chờ xác nhận', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: Clock },
    'processing': { label: 'Đang xử lý', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Package },
    'shipped': { label: 'Đang giao hàng', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Truck },
    'delivered': { label: 'Đã giao hàng', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CheckCircle2 },
    'cancelled': { label: 'Đã hủy', color: 'text-rose-600', bgColor: 'bg-rose-50', icon: XCircle },
};

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; nextStatus: string | null }>({ isOpen: false, nextStatus: null });

    const loadOrder = async () => {
        if (!token || !id) return;
        setLoading(true);
        const data = await fetchOrderById(id as string, token);
        setOrder(data);
        setLoading(false);
    };

    useEffect(() => {
        loadOrder();
    }, [token, id]);

    const handleStatusUpdate = async () => {
        const newStatus = confirmModal.nextStatus;
        if (!token || !order || !newStatus) return;

        setIsUpdating(true);
        try {
            const success = await updateOrderStatus(order.id, newStatus, token);
            if (success) {
                setOrder({ ...order, status: newStatus });
                showToast('Cập nhật trạng thái thành công!');
            } else {
                showToast('Cập nhật trạng thái thất bại.', 'error');
            }
        } catch (error) {
            console.error('Status update failed', error);
        } finally {
            setIsUpdating(false);
            setConfirmModal({ isOpen: false, nextStatus: null });
        }
    };

    const initiateStatusUpdate = (newStatus: string) => {
        if (['delivered', 'cancelled'].includes(order.status)) {
            return;
        }
        if (order.status === 'processing' && newStatus === 'pending') {
            return;
        }
        setConfirmModal({ isOpen: true, nextStatus: newStatus });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Không tìm thấy đơn hàng</h2>
                <button onClick={() => router.back()} className="mt-6 text-indigo-600 font-semibold">Quay lại danh sách</button>
            </div>
        );
    }

    const status = statusMap[order.status] || statusMap.pending;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-all text-gray-500"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">#{(order.id as string).split('-')[0].toUpperCase()}</h1>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.color}`}>
                            {status.label}
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Side: Order items & Summary */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Status Management */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Quản lý trạng thái</h3>
                        <div className="flex flex-wrap gap-3">
                            {statusOptions.map(s => {
                                const isCurrent = order.status === s;
                                const isProcessingToPending = order.status === 'processing' && s === 'pending';
                                const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                const isBackward = statusOrder.indexOf(s) < statusOrder.indexOf(order.status) && s !== 'cancelled';
                                const isTerminal = ['delivered', 'cancelled'].includes(order.status);

                                return (
                                    <button
                                        key={s}
                                        onClick={() => initiateStatusUpdate(s)}
                                        disabled={isUpdating || isCurrent || isProcessingToPending || isBackward || isTerminal}
                                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2
                                            ${isCurrent ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-600/10' :
                                                (isProcessingToPending || isBackward || isTerminal) ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' :
                                                    'bg-white border-gray-200 text-gray-600 hover:border-indigo-600 hover:text-indigo-600'}`}
                                    >
                                        {s === order.status && <CheckCircle2 size={14} />}
                                        {statusMap[s].label}
                                    </button>
                                );
                            })}
                        </div>
                        {(['delivered', 'cancelled'].includes(order.status)) && (
                            <p className="mt-4 text-xs text-rose-500 font-medium flex items-center gap-1.5">
                                <AlertCircle size={14} />
                                Đơn hàng đã ở trạng thái cuối cùng, không thể thay đổi thêm.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Danh sách sản phẩm ({order.items?.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-6">
                                    <div className="relative w-24 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                        <Image
                                            src={getImageUrl(item.product?.images?.[0] || '')}
                                            alt={item.product?.name || ''}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{item.product?.name}</h4>
                                                <p className="text-xs text-indigo-600 mt-0.5 font-medium">SKU: {item.product?.id.split('-')[0].toUpperCase()}</p>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{formatPrice(Number(item.unit_price) * item.quantity)}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-y-2 gap-x-4 mt-auto py-3 border-y border-gray-50 my-3">
                                            <div className="text-[11px]">
                                                <span className="text-gray-400 font-bold uppercase mr-1">Size:</span>
                                                <span className="text-gray-900 font-bold">{item.size}</span>
                                            </div>
                                            {item.color && (
                                                <div className="text-[11px]">
                                                    <span className="text-gray-400 font-bold uppercase mr-1">Color:</span>
                                                    <span className="text-gray-900 font-bold">{item.color}</span>
                                                </div>
                                            )}
                                            {item.material && (
                                                <div className="text-[11px]">
                                                    <span className="text-gray-400 font-bold uppercase mr-1">Vải:</span>
                                                    <span className="text-gray-900 font-bold">{item.material}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-gray-500 font-medium">Số lượng: x{item.quantity}</span>
                                            <span className="text-gray-400 font-medium">Đơn giá: {formatPrice(Number(item.unit_price))}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Info Panels */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Thông tin khách hàng</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                                    <User size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Người nhận</p>
                                    <p className="text-sm font-bold text-gray-900 truncate uppercase">{order.full_name}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Số điện thoại</p>
                                    <p className="text-sm font-bold text-gray-900 uppercase">{order.phone_number}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Địa chỉ giao hàng</p>
                                    <p className="text-xs font-semibold text-gray-600 leading-relaxed uppercase">{order.shipping_address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Chi tiết thanh toán</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Hình thức:</span>
                                    <span className="text-gray-900 font-bold uppercase">{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Phí vận chuyển:</span>
                                    <span className="text-gray-900 font-bold">{Number(order.total_amount) > 500000 ? 'MIỄN PHÍ' : '30.000₫'}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-gray-900 font-bold text-lg uppercase">Tổng cộng:</span>
                                    <span className="text-xl font-black text-indigo-600 italic tracking-tighter">{formatPrice(Number(order.total_amount))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Thay đổi trạng thái?"
                message={confirmModal.nextStatus ? `Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "${statusMap[confirmModal.nextStatus || 'pending'].label}"?` : ''}
                onConfirm={handleStatusUpdate}
                onCancel={() => setConfirmModal({ isOpen: false, nextStatus: null })}
                isLoading={isUpdating}
                type="info"
            />
        </div>
    );
}
