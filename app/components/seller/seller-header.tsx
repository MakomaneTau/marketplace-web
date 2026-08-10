"use client";

import { Bell, ChevronDown, Menu, Plus, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SellerHeaderProps = {
  onOpenMenu: () => void;
};

export function SellerHeader({ onOpenMenu }: SellerHeaderProps) {
  const [openMenu, setOpenMenu] = useState<"notifications" | "account" | null>(
    null,
  );
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenus = (event: PointerEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const closeMenusWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeMenusWithEscape);

    return () => {
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("keydown", closeMenusWithEscape);
    };
  }, []);

  const toggleMenu = (menu: "notifications" | "account") => {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Open seller menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-slate-500">Selling as</p>
          <p className="text-sm font-bold text-slate-950">Neo’s Student Store</p>
        </div>
      </div>

      <div ref={actionsRef} className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-800 sm:px-4"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add product</span>
          <span className="sm:hidden">Add Product</span>
        </Link>
        <div className="relative">
          <button
            type="button"
            className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 aria-expanded:border-violet-200 aria-expanded:bg-violet-50 aria-expanded:text-violet-700"
            aria-label="Notifications"
            aria-controls="seller-notifications-menu"
            aria-expanded={openMenu === "notifications"}
            onClick={() => toggleMenu("notifications")}
          >
            <Bell className="h-5 w-5" />
            {hasUnreadNotifications && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {openMenu === "notifications" && (
            <div
              id="seller-notifications-menu"
              className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-slate-950">Notifications</p>
                {hasUnreadNotifications && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-violet-700 hover:text-violet-900"
                    onClick={() => setHasUnreadNotifications(false)}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                <Link
                  href="/seller/orders"
                  className="block px-4 py-3 transition hover:bg-slate-50"
                  onClick={() => setOpenMenu(null)}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    New order received
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Review the order and arrange collection.
                  </p>
                </Link>
                <Link
                  href="/seller/messages"
                  className="block px-4 py-3 transition hover:bg-slate-50"
                  onClick={() => setOpenMenu(null)}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    You have a new message
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    A buyer asked about product availability.
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden sm:block">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-2 transition hover:bg-slate-50 aria-expanded:border-violet-200 aria-expanded:bg-violet-50"
            aria-label="Open seller account menu"
            aria-controls="seller-account-menu"
            aria-expanded={openMenu === "account"}
            onClick={() => toggleMenu("account")}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              KN
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform ${
                openMenu === "account" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu === "account" && (
            <div
              id="seller-account-menu"
              className="absolute right-0 top-[calc(100%+0.5rem)] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-sm font-bold text-slate-950">
                  Neo’s Student Store
                </p>
                <p className="text-xs text-slate-500">Seller account</p>
              </div>
              <nav className="mt-1" aria-label="Seller account">
                <Link
                  href="/seller/shop"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  onClick={() => setOpenMenu(null)}
                >
                  View shop profile
                </Link>
                <Link
                  href="/seller/settings"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                  onClick={() => setOpenMenu(null)}
                >
                  Account settings
                </Link>
                <Link
                  href="/seller/logout"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-slate-50 hover:text-slate-950"
                  onClick={() => setOpenMenu(null)}
                >
                  <LogOut className="mr-2 inline h-4 w-4" />
                  Log out
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
