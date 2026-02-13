import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/products?category=ao-thun', label: 'Áo Thun' },
    { href: '/products?category=ao-hoodie', label: 'Áo Hoodie' },
    { href: '/products?category=ao-khoac', label: 'Áo Khoác' },
    { href: '/products?category=quan', label: 'Quần' },
    { href: '/products?category=phu-kien', label: 'Phụ Kiện' },
  ],
  support: [
    { href: '/size-guide', label: 'Hướng Dẫn Chọn Size' },
    { href: '/shipping', label: 'Chính Sách Vận Chuyển' },
    { href: '/returns', label: 'Đổi Trả & Hoàn Tiền' },
    { href: '/faq', label: 'Câu Hỏi Thường Gặp' },
    { href: '/contact', label: 'Liên Hệ' },
  ],
  company: [
    { href: '/about', label: 'Về Chúng Tôi' },
    { href: '/studio', label: 'Design Studio' },
    { href: '/blog', label: 'Blog' },
    { href: '/careers', label: 'Tuyển Dụng' },
  ],
};

const socialLinks = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://youtube.com', icon: Youtube, label: 'Youtube' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a] pt-16 pb-8">
      <div className="container-street">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.jpg"
                alt="UNTYPED CLOTHING"
                width={180}
                height={60}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Thương hiệu thời trang đường phố dành cho những ai dám khác biệt.
              Không giới hạn, không khuôn mẫu - chỉ có phong cách của riêng bạn.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:0901234567" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone size={18} className="text-[#e60012]" />
                <span>0901 234 567</span>
              </a>
              <a href="mailto:hello@untyped.vn" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail size={18} className="text-[#e60012]" />
                <span>hello@untyped.vn</span>
              </a>
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin size={18} className="text-[#e60012] mt-0.5" />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Sản Phẩm</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#e60012] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Hỗ Trợ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#e60012] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Về UNTYPED</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#e60012] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="text-white font-bold mb-3">Đăng ký nhận tin</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="input-street flex-1 text-sm"
                />
                <button className="btn-street px-4 text-sm">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2a2a2a] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 UNTYPED CLOTHING. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
