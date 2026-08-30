import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";


interface MarketPlaceLayoutProps {
  children: React.ReactNode;
}

export default function MarketPlaceLayout({
  children,
}: MarketPlaceLayoutProps) {
  return (
    <div className="buyer-theme min-h-screen bg-background">
      <Header />

      {/*
       * pb-20 prevents the fixed mobile
       * navigation from covering content.
       */}

      <main className="min-h-screen pb-20 md:pb-0">
        {children}
      </main>

      <Footer />
    </div>
  );
}
