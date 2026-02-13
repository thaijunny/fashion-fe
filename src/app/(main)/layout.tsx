'use client';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoadingBar from "@/components/layout/LoadingBar";
import LoginModal from "@/components/auth/LoginModal";
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname === '/studio';

  return (
    <>
      <LoadingBar />
      <LoginModal />
      {!isStudio && <Header />}
      <main className={`flex-1 ${!isStudio ? 'pt-[104px] md:pt-[120px]' : ''}`}>
        {children}
      </main>
      {!isStudio && <Footer />}
    </>
  );
}
