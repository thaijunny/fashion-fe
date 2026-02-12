'use client';

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice, getImageUrl } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CartDrawer() {
  const { items, itemCount, total, isOpen, closeCart, removeItem, updateQuantity } = useCart();
  const { user, openLoginModal } = useAuth();
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const router = useRouter();

  const handleCheckout = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0f0f0f] border-l border-[#2a2a2a] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-[#e60012]" size={22} />
            <h2 className="text-white font-bold text-lg uppercase tracking-wider">
              Giỏ Hàng
            </h2>
            {itemCount > 0 && (
              <span className="bg-[#e60012] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-2 font-medium">Giỏ hàng trống</p>
              <p className="text-gray-600 text-sm mb-6">Hãy thêm sản phẩm vào giỏ hàng!</p>
              <button
                onClick={closeCart}
                className="text-[#e60012] font-medium hover:underline text-sm"
              >
                Tiếp tục mua sắm →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-[#1a1a1a] border border-[#2a2a2a] p-3 group hover:border-[#3a3a3a] transition-colors"
              >
                {/* Image */}
                <div className="relative w-20 h-24 flex-shrink-0 bg-[#0f0f0f] overflow-hidden">
                  {item.product?.images?.[0] ? (
                    <Image
                      src={getImageUrl(item.product.images[0])}
                      alt={item.product.name || ''}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="text-gray-600" size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product?.id}`}
                    onClick={closeCart}
                    className="text-white text-sm font-medium hover:text-[#e60012] transition-colors line-clamp-1"
                  >
                    {item.product?.name}
                  </Link>
                  <div className="flex gap-3 mt-1">
                    {item.size && (
                      <span className="text-gray-500 text-xs">Size: {item.size}</span>
                    )}
                    {item.color && (
                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                        <span
                          className="w-3 h-3 rounded-full border border-[#3a3a3a] inline-block"
                          style={{ backgroundColor: item.color }}
                        />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-[#2a2a2a]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-white text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-[#e60012] font-bold text-sm">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={async () => {
                    setRemovingId(item.id);
                    await removeItem(item.id);
                    setRemovingId(null);
                  }}
                  disabled={removingId === item.id}
                  className="self-start text-gray-600 hover:text-[#e60012] transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#2a2a2a] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 uppercase tracking-wider text-sm">Tổng cộng</span>
              <span className="text-white font-bold text-xl">{formatPrice(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-[#e60012] text-white font-bold uppercase tracking-wider hover:bg-[#ff1a2e] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              Thanh Toán
            </button>
            <Link
              href="/cart"
              onClick={closeCart}
              className="w-full py-4 bg-transparent border border-[#2a2a2a] text-white font-bold uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2"
            >
              Xem Giỏ Hàng
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
}
