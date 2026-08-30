"use client";

import { useEffect, useState, type ReactNode } from "react";

import { SellerHeader } from "./seller-header";
import { SellerMobileNav } from "./seller-mobile-nav";
import { SellerSidebar } from "./seller-sidebar";

type SellerShellProps = {
  children: ReactNode;
};

export function SellerShell({ children }: SellerShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="seller-theme min-h-screen bg-background text-slate-950">
      <div className="fixed inset-y-0 left-0 z-40">
        <SellerSidebar />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            aria-label="Close seller menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-fit shadow-2xl">
            <SellerSidebar mobile onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <SellerHeader onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <SellerMobileNav />
    </div>
  );
}
