'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw, Star, Quote } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { fetchProducts, getFeaturedProducts, getImageUrl, fetchTestimonials } from '@/lib/api';
import { Product } from '@/types';
import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, testimonialsData] = await Promise.all([
          fetchProducts(),
          fetchTestimonials(),
        ]);
        setAllProducts(prodData.items);
        setTestimonials(testimonialsData);
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
        <div className="relative z-10 container-street text-center px-4">
          <h1
            className="text-4xl md:text-7xl lg:text-9xl font-extrabold mb-4 md:mb-6 glitch-text tracking-tight"
          >
            <span className="text-white">UNTYPED</span>
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-white mb-6 md:mb-8 max-w-2xl mx-auto px-4 md:px-0">
            Thời trang đường phố cho những ai dám sống khác biệt.
            <br className="hidden md:block" />
            Thiết kế riêng. Phong cách riêng.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Link href="/products" className="w-full sm:w-auto px-8 py-3 bg-[#e60012] text-white hover:bg-[#ff1a1a] transition-colors flex items-center justify-center gap-2 rounded font-bold uppercase tracking-wider text-sm shadow-lg shadow-red-600/20">
              Khám Phá Ngay
              <ArrowRight size={18} />
            </Link>
            <Link href="/studio" className="w-full sm:w-auto px-8 py-3 bg-white text-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 rounded font-bold uppercase tracking-wider text-sm">
              <Sparkles size={18} />
              Design Studio
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-[#e60012] py-6 relative z-20">
        <div className="container-street">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 text-white text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 md:mb-0">
                <Truck size={18} />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Freeship từ 500K</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 md:mb-0">
                <Shield size={18} />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Bảo hành 30 ngày</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 md:mb-0">
                <RotateCcw size={18} />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Đổi trả dễ dàng</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-1 md:mb-0">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Thiết kế độc quyền</span>
            </div>
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
      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-[#0f0f0f] relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e60012]/5 rounded-full blur-[200px]" />

          <div className="container-street relative z-10">
            <div className="text-center mb-12">
              <h2 className="section-title text-white font-extrabold">
                Khách Hàng Nhận Xét
              </h2>
              <p className="text-gray-400 mt-4">Những chia sẻ từ khách hàng đã trải nghiệm sản phẩm</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, index) => (
                <div
                  key={t.id}
                  className="relative bg-[#1a1a1a] border border-[#2a2a2a] p-6 group hover:border-[#e60012]/30 transition-all duration-300 slide-up flex flex-col items-center text-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Circular Avatar */}
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-[#2a2a2a] border-4 border-[#2a2a2a] group-hover:border-[#e60012]/40 transition-colors mb-5 flex-shrink-0">
                    {t.avatar_url ? (
                      <img src={getImageUrl(t.avatar_url)} alt={t.customer_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#e60012] font-bold text-3xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                        {t.customer_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Quote icon */}
                  <Quote className="text-[#e60012]/30 mb-3" size={28} />

                  {/* Content */}
                  <p className="text-gray-300 leading-relaxed mb-4 text-sm line-clamp-4">
                    {t.content}
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= t.rating ? 'text-[#f0ff00] fill-[#f0ff00]' : 'text-gray-700'}
                      />
                    ))}
                  </div>

                  {/* Customer name */}
                  <p className="text-white font-semibold text-sm">{t.customer_name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Khách hàng</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
