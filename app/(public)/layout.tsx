import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";


interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <OnboardingProvider role="buyer">
      <div className="buyer-theme min-h-[100dvh] overflow-x-clip bg-background">
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
    </OnboardingProvider>
  );
}
