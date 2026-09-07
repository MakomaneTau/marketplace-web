"use client";

import { LayoutDashboard, MessageSquare, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UnreadMessageBadge } from "@/app/components/messaging/unread-messages";
import { cn } from "@/app/libs/utils";

const items = [
  { label: "Home", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller/products", icon: Package },
  { label: "Orders", href: "/seller/orders", icon: ShoppingBag },
  { label: "Messages", href: "/seller/messages", icon: MessageSquare },
];

export function SellerMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 lg:hidden"
      aria-label="Seller mobile navigation"
    >
      {items.map((item) => {
        const active = item.href === "/seller" ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-1 py-1 text-[11px] font-semibold",
              active ? "text-violet-700" : "text-slate-500",
            )}
          >
            <span className="relative">
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.href === "/seller/messages" && <span className="absolute -right-4 -top-2"><UnreadMessageBadge /></span>}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
