'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDesignOrderById, formatPrice, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import { ChevronRight, Clock, Printer, Truck, CheckCircle2, XCircle, Palette, ArrowLeft } from 'lucide-react';

const statusSteps = [
    { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
    { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle2 },
    { key: 'printing', label: 'Đang in', icon: Printer },
    { key: 'shipped', label: 'Đang giao', icon: Truck },
    { key: 'done', label: 'Hoàn thành', icon: CheckCircle2 },
];

export default function DesignOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { token } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && id) {
            fetchDesignOrderById(id, token).then(data => {
                setOrder(data);
                setLoading(false);
            });
        }
    }, [token, id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center container-street">
                <div className="w-10 h-10 border-4 border-[#e60012]/20 border-t-[#e60012] rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container-street pb-24 pt-8">
                <p className="text-gray-500 text-center text-lg">Không tìm thấy đơn hàng</p>
            </div>
        );
    }

    const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="container-street pb-24">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8 py-4">
                <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                <ChevronRight size={12} />
                <Link href="/design-orders" className="hover:text-white transition-colors">Đơn thiết kế</Link>
                <ChevronRight size={12} />
                <span className="text-white">Chi tiết</span>
            </div>

            <Link href="/design-orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
                <ArrowLeft size={16} /> Quay lại
            </Link>

            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-8">
                Đơn <span className="text-[#e60012]">#{order.id.split('-')[0]}</span>
            </h1>

            {/* Status timeline */}
            {!isCancelled ? (
                <div className="bg-[#111] border border-[#2a2a2a] p-6 mb-8">
                    <div className="flex items-center justify-between">
                        {statusSteps.map((step, i) => {
                            const StepIcon = step.icon;
                            const isActive = i <= currentStepIndex;
                            return (
                                <div key={step.key} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-[#e60012] bg-[#e60012]/20 text-[#e60012]' : 'border-[#333] text-gray-600'}`}>
                                        <StepIcon size={18} />
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                        {step.label}
                                    </span>
                                    {i < statusSteps.length - 1 && (
                                        <div className={`absolute h-0.5 ${isActive ? 'bg-[#e60012]' : 'bg-[#333]'}`} style={{ width: '100%' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-red-500/10 border border-red-500/30 p-4 mb-8 flex items-center gap-3">
                    <XCircle className="text-red-500" size={20} />
                    <span className="text-red-400 font-bold uppercase tracking-widest text-sm">Đơn hàng đã bị hủy</span>
                </div>
            )}


            <div className="grid md:grid-cols-2 gap-8">
                {/* Preview */}
                <div className="bg-[#111] border border-[#2a2a2a] p-6">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Bản thiết kế</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500 text-xs mb-2">Mặt trước</p>
                            <div className="aspect-[3/4] bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
                                {order.project?.preview_front ? (
                                    <img src={order.project.preview_front.startsWith('data:') ? order.project.preview_front : getImageUrl(order.project.preview_front)} alt="Front" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Palette className="text-gray-600" /></div>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs mb-2">Mặt sau</p>
                            <div className="aspect-[3/4] bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
                                {order.project?.preview_back ? (
                                    <img src={order.project.preview_back.startsWith('data:') ? order.project.preview_back : getImageUrl(order.project.preview_back)} alt="Back" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Palette className="text-gray-600" /></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order info */}
                <div className="space-y-6">
                    <div className="bg-[#111] border border-[#2a2a2a] p-6">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Thông tin đơn hàng</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phôi áo</span>
                                <span className="text-white font-bold">{order.garment_template?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Size</span>
                                <span className="text-white font-bold">{order.garment_size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Màu sắc</span>
                                <span className="text-white font-bold">{order.garment_color}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Số lượng</span>
                                <span className="text-white font-bold">{order.quantity}</span>
                            </div>
                            <div className="border-t border-[#2a2a2a] pt-3 flex justify-between">
                                <span className="text-gray-500 font-bold">Tổng cộng</span>
                                <span className="text-[#e60012] font-black italic text-xl">{formatPrice(Number(order.total_amount))}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-[#2a2a2a] p-6">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Thông tin giao hàng</h3>
                        <div className="space-y-2 text-sm">
                            <p className="text-white font-bold">{order.full_name || '—'}</p>
                            <p className="text-gray-400">{order.phone_number || '—'}</p>
                            <p className="text-gray-400">{order.shipping_address || '—'}</p>
                            {order.note && <p className="text-gray-500 italic mt-2">Ghi chú: {order.note}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
