'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getImageUrl } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
    const { items, total, itemCount, updateQuantity, removeItem } = useCart();
    const { user, openLoginModal } = useAuth();
    const [removingId, setRemovingId] = useState<string | null>(null);

    // Constants
    const shippingFee = total > 500000 ? 0 : 30000;
    const grandTotal = total + shippingFee;

    const router = useRouter();

    const handleCheckout = () => {
        if (!user) {
            openLoginModal();
            return;
        }
        router.push('/checkout');
    };

    if (itemCount === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center container-street text-center">
                <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-gray-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-4 uppercase tracking-tighter italic">Giỏ hàng của bạn đang trống</h1>
                <p className="text-gray-400 mb-8 max-w-md">Có vẻ như bạn chưa chọn được món đồ nào? Đừng lo, hàng nghìn sản phẩm streetwear cực chất đang chờ bạn.</p>
                <Link
                    href="/products"
                    className="btn-street inline-flex items-center gap-2 group"
                >
                    <ShoppingBag size={18} />
                    Tiếp tục mua sắm
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        );
    }

    return (
        <div className="container-street pb-24">
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
                    Giỏ Hàng <span className="text-[#e60012]">({itemCount})</span>
                </h1>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Left: Item List */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#2a2a2a] text-gray-500 text-xs font-bold uppercase tracking-widest">
                        <div className="col-span-6">Sản phẩm</div>
                        <div className="col-span-2 text-center">Số lượng</div>
                        <div className="col-span-3 text-right">Tổng cộng</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-12 gap-4 py-6 border-b border-[#2a2a2a] group hover:bg-[#1a1a1a]/30 transition-colors"
                                style={{ opacity: removingId === item.id ? 0.5 : 1 }}
                            >
                                {/* Product Info */}
                                <div className="col-span-12 md:col-span-6 flex gap-4">
                                    <div className="relative w-24 h-32 md:w-32 md:h-40 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                                        <Image
                                            src={getImageUrl(item.product?.images?.[0] || '')}
                                            alt={item.product?.name || ''}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-between py-1">
                                        <div>
                                            <Link
                                                href={`/product/${item.product?.id}`}
                                                className="text-white font-bold text-lg hover:text-[#e60012] transition-colors leading-tight block mb-2"
                                            >
                                                {item.product?.name}
                                            </Link>
                                            <div className="flex gap-4 text-xs">
                                                {item.size && (
                                                    <p className="text-gray-400 capitalize">Kích thước: <span className="text-white font-bold">{item.size}</span></p>
                                                )}
                                                {item.color && (
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        Màu sắc:
                                                        <div
                                                            className="w-3.5 h-3.5 rounded-full border border-[#333]"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                    </div>
                                                )}
                                                {item.material && (
                                                    <p className="text-gray-400 capitalize">Chất liệu: <span className="text-white font-bold">{item.material}</span></p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-[#e60012] font-bold md:hidden">
                                            {(() => {
                                                const activeVariant = item.product?.variants?.find((v: any) =>
                                                    (!v.size || v.size === item.size) &&
                                                    (!v.color || v.color === item.color) &&
                                                    (!v.material || v.material === item.material)
                                                );
                                                return formatPrice(activeVariant?.price || item.product?.price || 0);
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="col-span-6 md:col-span-2 flex items-center justify-center">
                                    <div className="flex items-center border border-[#2a2a2a] bg-[#0a0a0a]">
                                        <button
                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-10 text-center text-white font-bold text-sm">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Subtotal Item */}
                                <div className="col-span-5 md:col-span-3 flex items-center justify-end">
                                    <div className="text-right">
                                        <p className="text-white font-black text-xl tracking-tighter italic">
                                            {(() => {
                                                const activeVariant = item.product?.variants?.find((v: any) =>
                                                    (!v.size || v.size === item.size) &&
                                                    (!v.color || v.color === item.color) &&
                                                    (!v.material || v.material === item.material)
                                                );
                                                const price = activeVariant?.price || item.product?.price || 0;
                                                return formatPrice(price * item.quantity);
                                            })()}
                                        </p>
                                        <p className="text-gray-600 text-[10px] font-bold uppercase hidden md:block">
                                            Tạm tính
                                        </p>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <div className="col-span-1 flex items-center justify-end">
                                    <button
                                        onClick={async () => {
                                            setRemovingId(item.id);
                                            await removeItem(item.id);
                                            setRemovingId(null);
                                        }}
                                        disabled={removingId === item.id}
                                        className="text-gray-600 hover:text-[#e60012] transition-colors p-2"
                                        title="Xóa khỏi giỏ hàng"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors pt-4"
                    >
                        <ArrowLeft size={16} />
                        Tiếp tục mua sắm
                    </Link>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-4">
                    <div className="sticky top-32 space-y-6">
                        <div className="bg-[#111] border border-[#222] p-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8 border-b border-[#2a2a2a] pb-4">Tóm tắt đơn hàng</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-gray-400">
                                    <span className="text-sm font-bold uppercase tracking-wider">Tạm tính ({itemCount} món)</span>
                                    <span className="text-white font-bold">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-400">
                                    <span className="text-sm font-bold uppercase tracking-wider">Phí vận chuyển</span>
                                    <span>{shippingFee === 0 ? <span className="text-green-500 font-bold uppercase">Miễn phí</span> : formatPrice(shippingFee)}</span>
                                </div>
                                {shippingFee > 0 && (
                                    <p className="text-[10px] text-[#e60012] font-bold uppercase tracking-wider bg-[#e60012]/10 p-2 mt-2">
                                        Mua thêm {formatPrice(500000 - total)} để được Miễn phí vận chuyển
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-[#2a2a2a] pt-6 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black text-white uppercase tracking-tighter italic">Tổng cộng</span>
                                    <span className="text-3xl font-black text-[#e60012] tracking-tighter italic">{formatPrice(grandTotal)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn-street w-full py-5 text-lg font-black italic tracking-tighter rounded-none flex items-center justify-center gap-3"
                            >
                                Tiến hành thanh toán
                                <ArrowRight size={22} className="italic" />
                            </button>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-4 bg-[#111] p-4 border border-[#222]">
                                <ShieldCheck className="text-[#e60012] flex-shrink-0" size={32} />
                                <div>
                                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Thanh toán an toàn</h4>
                                    <p className="text-gray-500 text-[10px]">Bảo mật thông tin 100%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-[#111] p-4 border border-[#222]">
                                <Truck className="text-[#e60012] flex-shrink-0" size={32} />
                                <div>
                                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Giao hàng hỏa tốc</h4>
                                    <p className="text-gray-500 text-[10px]">Từ 2-4 ngày làm việc</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-[#111] p-4 border border-[#222]">
                                <RotateCcw className="text-[#e60012] flex-shrink-0" size={32} />
                                <div>
                                    <h4 className="text-white text-xs font-bold uppercase tracking-widest">Đổi trả 30 ngày</h4>
                                    <p className="text-gray-500 text-[10px]">Dễ dàng và nhanh chóng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
