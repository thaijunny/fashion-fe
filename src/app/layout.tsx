import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/ui/Toast";
import { SettingsProvider } from "@/context/SettingsContext";

// Be Vietnam Pro - Modern font with full Vietnamese support
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://untyped.com.vn'),
  title: {
    default: "UNTYPED CLOTHING | Streetwear Việt Nam",
    template: "%s | UNTYPED CLOTHING",
  },
  description: "Thương hiệu thời trang đường phố dành cho những ai dám khác biệt. Không giới hạn, không khuôn mẫu - chỉ có phong cách của riêng bạn.",
  keywords: ["streetwear", "thời trang đường phố", "quần áo", "untyped", "việt nam", "design studio", "thời trang", "untyped clothing"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "UNTYPED CLOTHING | Streetwear Việt Nam",
    description: "Thương hiệu thời trang đường phố dành cho những ai dám khác biệt.",
    url: 'https://untyped.com.vn',
    siteName: 'UNTYPED CLOTHING',
    type: "website",
    locale: "vi_VN",
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <SettingsProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </SettingsProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

