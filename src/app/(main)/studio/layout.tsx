import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Studio | UNTYPED CLOTHING",
  description: "Tự tay thiết kế quần áo theo phong cách riêng của bạn với công cụ thiết kế chuyên nghiệp.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Google Fonts for Design Studio */}
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Bangers&family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Dancing+Script:wght@400;700&family=Montserrat:wght@400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&family=Permanent+Marker&family=Playfair+Display:wght@400;700&family=Righteous&family=Roboto:wght@400;500;700&family=Russo+One&display=swap"
        rel="stylesheet"
      />
      {children}
    </div>
  );
}
