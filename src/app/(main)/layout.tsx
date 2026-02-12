import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoadingBar from "@/components/layout/LoadingBar";
import LoginModal from "@/components/auth/LoginModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingBar />
      <LoginModal />
      <Header />
      <main className="flex-1 pt-[104px] md:pt-[120px]">
        {children}
      </main>
      <Footer />
    </>
  );
}
