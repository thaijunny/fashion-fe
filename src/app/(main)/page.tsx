'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { fetchProducts, getFeaturedProducts, fetchCategories, getImageUrl } from '@/lib/api';
import { Product } from '@/types';
import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        setAllProducts(prodData.items);
        setCategories(catData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadData();
  }, []);

  const featuredProducts = getFeaturedProducts(allProducts);


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden grunge-overlay">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
          {/* Animated Grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: settings.banner_image
                ? `url('${getImageUrl(settings.banner_image)}')`
                : "url('/images/background.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Red Glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e60012]/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#f0ff00]/10 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 container-street text-center">
          <h1
            className="text-5xl md:text-7xl lg:text-9xl font-extrabold mb-6 glitch-text tracking-tight"
          >
            <span className="text-white">UNTYPED</span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
            Thời trang đường phố cho những ai dám sống khác biệt.
            <br />
            Thiết kế riêng. Phong cách riêng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-4 py-2 bg-[#e60012] text-white hover:bg-[#ff1a1a] transition-colors flex items-center gap-2 rounded">
              Khám Phá Ngay
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link href="/studio" className="px-4 py-2 bg-[#e60012] text-white hover:bg-[#ff1a1a] transition-colors flex items-center gap-2 rounded">
              <Sparkles className="mr-2" size={20} />
              Design Studio
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-[#e60012] py-4">
        <div className="container-street">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
            <div className="flex items-center justify-center gap-2">
              <Truck size={20} />
              <span className="text-sm font-medium">Freeship từ 500K</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield size={20} />
              <span className="text-sm font-medium">Bảo hành 30 ngày</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <RotateCcw size={20} />
              <span className="text-sm font-medium">Đổi trả dễ dàng</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={20} />
              <span className="text-sm font-medium">Thiết kế độc quyền</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-[#0a0a0a]">
        <div className="container-street">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title text-white font-extrabold">
                Danh Mục Sản Phẩm
              </h2>
              <p className="text-gray-400 mt-4">Khám phá bộ sưu tập đa dạng của chúng tôi</p>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-[#e60012] hover:text-[#ff1a2e] transition-colors font-medium"
            >
              Xem tất cả <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-[#1a1a1a] slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Category image */}
                <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-500">
                  {category.image ? (
                    <img
                      src={getImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-[#e60012]/10 flex items-center justify-center">
                        <span className="text-4xl">👕</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg group-hover:text-[#e60012] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{category.productCount} sản phẩm</p>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#e60012] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-[#0f0f0f]">
        <div className="container-street">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title text-white font-extrabold">
                Sản Phẩm Nổi Bật
              </h2>
              <p className="text-gray-400 mt-4">Những thiết kế được yêu thích nhất</p>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-[#e60012] hover:text-[#ff1a2e] transition-colors font-medium"
            >
              Xem tất cả <ArrowRight size={18} />
            </Link>
          </div>

          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link href="/products" className="btn-street">
              Xem tất cả sản phẩm
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Design Studio CTA */}
      <section className="py-16 md:py-24 bg-[#0a0a0a] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#e60012]/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f0ff00]/5 rounded-full blur-[150px]" />
        </div>

        <div className="container-street relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#f0ff00] font-medium uppercase tracking-wider mb-4 block">
                Tính năng độc quyền
              </span>
              <h2
                className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
              >
                DESIGN <span className="text-[#e60012]">STUDIO</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Tự tay thiết kế quần áo theo phong cách riêng của bạn với công cụ thiết kế
                chuyên nghiệp. Thêm hình ảnh, text, stickers và nhiều hơn nữa!
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Công cụ thiết kế drag & drop dễ sử dụng',
                  'Hàng ngàn templates sẵn có',
                  'Upload hình ảnh của riêng bạn',
                  'Xem trước 3D trên sản phẩm thực tế',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-[#e60012] rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/studio" className="btn-street btn-neon inline-flex">
                <Sparkles className="mr-2" size={20} />
                Bắt đầu thiết kế
              </Link>
            </div>

            <div className="relative aspect-square">
              {/* Mockup Preview */}
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <img
                  src={settings.studio_image ? getImageUrl(settings.studio_image) : '/images/studio-demo.png'}
                  alt="Design Studio Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-[#e60012] opacity-50" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-[#f0ff00] opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-[#e60012]">
        <div className="container-street text-center">
          <h2
            className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight"
          >
            NHẬN THÔNG TIN MỚI NHẤT
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Đăng ký để nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và các sự kiện độc quyền.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
            />
            <button className="px-8 py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors">
              Đăng Ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
