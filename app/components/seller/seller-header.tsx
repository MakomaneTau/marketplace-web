"use client";

import { Bell, ChevronDown, Menu, Plus } from "lucide-react";
import Link from "next/link";

type SellerHeaderProps = {
  onOpenMenu: () => void;
};

export function SellerHeader({ onOpenMenu }: SellerHeaderProps) {
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

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-800 sm:px-4"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add product</span>
          <span className="sm:hidden">Add</span>
        </Link>
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-2 hover:bg-slate-50 sm:flex"
          aria-label="Open seller account menu"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">KN</span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
