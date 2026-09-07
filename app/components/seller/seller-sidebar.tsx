"use client";

import {
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { apiRequest, SELLER_DATA_EVENT } from "@/app/libs/api";
import { UnreadMessageBadge } from "@/app/components/messaging/unread-messages";
import { cn } from "@/app/libs/utils";

const navigation = [
  { label: "Overview", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ShoppingBag },
  { label: "Messages", href: "/seller/messages", icon: MessageSquare },
  { label: "Analytics", href: "/seller/analytics", icon: BarChart3 },
  { label: "My shop", href: "/seller/shop", icon: Store },
  { label: "Settings", href: "/seller/settings", icon: Settings },
];

type SellerSidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

export function SellerSidebar({ mobile = false, onClose }: SellerSidebarProps) {
  const pathname = usePathname();
  const [shopHealth, setShopHealth] = useState<{ percentage: number; hasShop: boolean } | null>(null);

  useEffect(() => {
    const loadShopHealth = () => {
      apiRequest<{
        name: string;
        tagline: string | null;
        description: string | null;
        logo_url: string | null;
        banner_url: string | null;
        pickup_areas: unknown[];
      } | null>("/seller/shop", { auth: true }).then((shop) => {
        if (!shop) return setShopHealth({ percentage: 0, hasShop: false });
        const completed = [shop.name, shop.tagline, shop.description, shop.logo_url, shop.banner_url, shop.pickup_areas.length > 0].filter(Boolean).length;
        setShopHealth({ percentage: Math.round(completed / 6 * 100), hasShop: true });
      }).catch(() => setShopHealth(null));
    };
    loadShopHealth();
    window.addEventListener(SELLER_DATA_EVENT, loadShopHealth);
    return () => window.removeEventListener(SELLER_DATA_EVENT, loadShopHealth);
  }, []);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white",
        mobile ? "w-[86vw] max-w-80" : "hidden w-64 lg:flex",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <Link href="/seller" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-700 text-sm font-black text-white">
            M
          </span>
          <span>
            <span className="block text-sm font-black tracking-tight text-slate-950">MarketPal</span>
            <span className="block text-[11px] font-medium text-slate-500">Seller centre</span>
          </span>
        </Link>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close seller menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Seller navigation">
        {navigation.map((item) => {
          const isOverview = item.href === "/seller";
          const active = isOverview ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-violet-50 text-violet-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}{item.href === "/seller/messages" && <UnreadMessageBadge />}
            </Link>
          );
        })}
      </nav>

      {shopHealth && shopHealth.percentage < 100 && <div className="border-t border-slate-200 p-4">
        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xs font-semibold text-violet-200">Store health</p>
          <p className="mt-1 text-sm font-bold">{shopHealth.hasShop ? `Your shop is ${shopHealth.percentage}% complete` : "Create your shop profile"}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-violet-400 transition-[width]" style={{ width: `${shopHealth.percentage}%` }} />
          </div>
          <Link href="/seller/shop" className="mt-3 inline-block text-xs font-semibold text-white underline">
            {shopHealth.hasShop ? "Complete shop profile" : "Set up shop"}
          </Link>
        </div>
      </div>}
    </aside>
  );
}
