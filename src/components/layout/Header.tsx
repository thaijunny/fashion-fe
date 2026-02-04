'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search, ShoppingBag, User } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Trang Chủ' },
  { href: '/products', label: 'Sản Phẩm' },
  { href: '/studio', label: 'Design Studio' },
  { href: '/about', label: 'Về Chúng Tôi' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a]">
      {/* Announcement Bar */}
      <div className="bg-[#e60012] text-white text-center py-2 text-sm font-medium">
        <div className="marquee-container">
          <span className="marquee-content">
            🔥 FREESHIP CHO ĐƠN HÀNG TỪ 500K • GIẢM 10% CHO THÀNH VIÊN MỚI • THIẾT KẾ RIÊNG TẠI DESIGN STUDIO 🔥
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            🔥 FREESHIP CHO ĐƠN HÀNG TỪ 500K • GIẢM 10% CHO THÀNH VIÊN MỚI • THIẾT KẾ RIÊNG TẠI DESIGN STUDIO 🔥
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-street">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white hover:text-[#e60012] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="UNTYPED CLOTHING"
              width={140}
              height={50}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-white font-medium uppercase tracking-wider text-sm hover:text-[#e60012] transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e60012] transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              className="p-2 text-white hover:text-[#e60012] transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* User */}
            <Link
              href="/account"
              className="hidden md:block p-2 text-white hover:text-[#e60012] transition-colors"
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-white hover:text-[#e60012] transition-colors"
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e60012] text-white text-xs flex items-center justify-center rounded-full font-bold">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border-b border-[#2a2a2a] p-4 slide-up">
          <div className="container-street">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="input-street w-full pl-12 pr-4"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setIsSearchOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-[#2a2a2a]">
          <nav className="container-street py-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-white font-medium uppercase tracking-wider border-b border-[#2a2a2a] last:border-0 hover:text-[#e60012] transition-colors slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
