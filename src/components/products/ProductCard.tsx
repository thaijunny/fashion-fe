'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/api';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { user, openLoginModal } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openLoginModal();
      return;
    }

    setAddingToCart(true);
    // Use first size and color as default for quick-add
    const defaultSize = product.sizes[0]?.name || 'M';
    const defaultColor = product.colors[0]?.hexCode || '#000000';

    await addToCart(product.id, defaultSize, defaultColor, 1);
    setAddingToCart(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group card-street relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-[#e60012]/20 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-[#e60012]" />
              </div>
              <span className="text-gray-500 text-sm">{product.name}</span>
            </div>
          </div>
        ) : (
          <Image
            src={getImageUrl(product.images[0])}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'
              }`}
            onError={() => setImageError(true)}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="badge-new">MỚI</span>
          )}
          {product.isOnSale && discount > 0 && (
            <span className="badge-sale">-{discount}%</span>
          )}
          {product.isBestSeller && !product.isNew && (
            <span className="badge-hot">HOT</span>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
        >
          <button
            className="w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#e60012] transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart size={18} />
          </button>
          <Link
            href={`/product/${product.id}`}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#e60012] transition-colors"
            aria-label="Quick view"
          >
            <Eye size={18} />
          </Link>
        </div>

        {/* Add to Cart Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
            }`}
        >
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`w-full py-3 ${addedSuccess ? 'bg-green-600' : 'bg-[#e60012] hover:bg-[#ff1a2e]'} text-white font-medium uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-70`}
          >
            {addingToCart ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : addedSuccess ? (
              <>
                <Check size={16} />
                Đã thêm!
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                Thêm vào giỏ
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-white font-medium mb-2 line-clamp-2 hover:text-[#e60012] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Sizes Preview */}
        <div className="flex gap-1 mb-3">
          {product.sizes.slice(0, 4).map((size) => (
            <span
              key={size.id}
              className="text-xs text-gray-500 px-2 py-0.5 border border-[#2a2a2a]"
            >
              {size.name}
            </span>
          ))}
          {product.sizes.length > 4 && (
            <span className="text-xs text-gray-500">+{product.sizes.length - 4}</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-[#e60012] font-bold text-lg">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-gray-500 line-through text-sm">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Color Options */}
        <div className="flex gap-2 mt-3">
          {product.colors.map((color) => (
            <button
              key={color.id}
              className="w-5 h-5 rounded-full border-2 border-[#2a2a2a] hover:border-white transition-colors"
              style={{ backgroundColor: color.hexCode }}
              aria-label={`Color: ${color.name}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
