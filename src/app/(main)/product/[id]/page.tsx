'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Heart, Minus, Plus, Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { fetchProductById, fetchProducts, formatPrice } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { id } = await params;
      const p = await fetchProductById(id);
      setProduct(p);
      if (p) {
        setSelectedSize(p.sizes[0] || '');
        setSelectedColor(p.colors[0] || '');
        // Fetch related products from same category
        const all = await fetchProducts(p.category);
        setRelated(all.filter(r => r.id !== p.id).slice(0, 4));
      }
      setLoading(false);
    })();
  }, [params]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!selectedSize || !selectedColor) return;
    setAddingToCart(true);
    await addToCart(product!.id, selectedSize, selectedColor, quantity);
    setAddingToCart(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#e60012] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy sản phẩm</h2>
          <Link href="/products" className="text-[#e60012] hover:underline">
            ← Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const colorNames: Record<string, string> = {
    '#000000': 'Đen', '#ffffff': 'Trắng', '#e60012': 'Đỏ',
    '#0a0a0a': 'Đen đậm', '#1a1a1a': 'Xám đen', '#2a2a2a': 'Xám tối',
    '#1a1a3a': 'Navy', '#f0ff00': 'Vàng neon', '#1a3a1a': 'Xanh rêu',
    '#3a3a2a': 'Olive', '#C0C0C0': 'Bạc', '#FFD700': 'Vàng',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Breadcrumb */}
      <div className="container-street py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-white transition-colors">Sản phẩm</Link>
          <ChevronRight size={14} />
          <span className="text-white">{product.name}</span>
        </div>
      </div>

      {/* Product Main */}
      <div className="container-street pb-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden group">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <span className="badge-new">MỚI</span>}
                {product.isOnSale && discount > 0 && <span className="badge-sale">-{discount}%</span>}
                {product.isBestSeller && <span className="badge-hot">HOT</span>}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-24 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-[#e60012]' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} - ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <p className="text-[#e60012] text-sm font-medium uppercase tracking-wider">
              {product.category.replace(/-/g, ' ')}
            </p>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-[#e60012]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-[#e60012] text-white text-sm font-bold px-2 py-1">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed">
              {product.description}
            </p>

            <hr className="border-[#2a2a2a]" />

            {/* Size Selector */}
            <div>
              <h3 className="text-white font-medium mb-3 uppercase tracking-wider text-sm">
                Kích thước: <span className="text-[#e60012]">{selectedSize}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] h-11 px-3 border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? 'bg-[#e60012] border-[#e60012] text-white'
                        : 'border-[#2a2a2a] text-gray-400 hover:border-white hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <h3 className="text-white font-medium mb-3 uppercase tracking-wider text-sm">
                Màu sắc: <span className="text-[#e60012]">{colorNames[selectedColor] || selectedColor}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                      selectedColor === color
                        ? 'border-[#e60012] scale-110 ring-2 ring-[#e60012]/30'
                        : 'border-[#2a2a2a] hover:border-white'
                    }`}
                    style={{ backgroundColor: color }}
                    title={colorNames[color] || color}
                  >
                    {selectedColor === color && (
                      <Check size={16} className="absolute inset-0 m-auto text-white drop-shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-white font-medium mb-3 uppercase tracking-wider text-sm">
                Số lượng
              </h3>
              <div className="flex items-center border border-[#2a2a2a] w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center text-white font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`flex-1 py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all ${
                  addedSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-[#e60012] text-white hover:bg-[#ff1a2e]'
                } disabled:opacity-70`}
              >
                {addingToCart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : addedSuccess ? (
                  <>
                    <Check size={18} />
                    Đã thêm vào giỏ!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
              <button className="w-13 h-13 border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-[#e60012] hover:border-[#e60012] transition-colors px-4">
                <Heart size={20} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                '✈️ Freeship từ 500K',
                '🔄 Đổi trả 30 ngày',
                '🛡️ Bảo hành chất lượng',
                '🎨 Có thể customize',
              ].map((feature) => (
                <div key={feature} className="text-gray-400 text-sm py-2 px-3 bg-[#1a1a1a] border border-[#2a2a2a]">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-extrabold text-white mb-8 uppercase tracking-tight">
              Sản phẩm tương tự
            </h2>
            <div className="products-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
