"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

import { UnreadMessagesProvider } from "@/app/components/messaging/unread-messages";
import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { useAuth } from "@/app/hooks/use-auth";
import { SESSION_ERROR_MESSAGE } from "@/app/libs/api";

import { SellerHeader } from "./seller-header";
import { SellerMobileNav } from "./seller-mobile-nav";
import { SellerSidebar } from "./seller-sidebar";

type SellerShellProps = {
  children: ReactNode;
};

export function SellerShell({ children }: SellerShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { auth, ready } = useAuth();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!ready) {
    return <p role="status" className="p-8 text-center text-muted">Checking seller access...</p>;
  }
  if (!auth) return <ProtectedRequestError message={SESSION_ERROR_MESSAGE} />;
  if (auth.profile?.role !== "seller") {
    return (
      <section className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">A seller profile is required</h1>
        <p className="text-muted">Register as a seller before creating listings or managing a shop.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup" className="rounded-control bg-primary px-5 py-3 font-semibold text-white">Register as a seller</Link>
          <Link href="/" className="rounded-control border border-border px-5 py-3 font-semibold">Back to marketplace</Link>
        </div>
      </section>
    );
  }

  return (
    <UnreadMessagesProvider><div className="seller-theme min-h-screen bg-background text-slate-950">
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
    </div></UnreadMessagesProvider>
  );
}
