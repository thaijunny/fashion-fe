import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

// Be Vietnam Pro - Modern font with full Vietnamese support
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UNTYPED CLOTHING | Streetwear Việt Nam",
  description: "Thương hiệu thời trang đường phố dành cho những ai dám khác biệt. Không giới hạn, không khuôn mẫu - chỉ có phong cách của riêng bạn.",
  keywords: ["streetwear", "thời trang đường phố", "quần áo", "untyped", "việt nam", "design studio"],
  openGraph: {
    title: "UNTYPED CLOTHING | Streetwear Việt Nam",
    description: "Thương hiệu thời trang đường phố dành cho những ai dám khác biệt.",
    type: "website",
    locale: "vi_VN",
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
