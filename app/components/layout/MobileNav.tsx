"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  Grid2X2,
  Heart,
  Home,
  LogIn,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/app/libs/utils";

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainMenuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Search marketplace",
    href: "/search",
    icon: Search,
  },
  {
    label: "Browse categories",
    href: "/categories",
    icon: Grid2X2,
  },
  {
    label: "Favourites",
    href: "/favourites",
    icon: Heart,
  },
  {
    label: "My purchases",
    href: "/orders",
    icon: Package,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    label: "My profile",
    href: "/profile",
    icon: UserRound,
  },
];

const supportMenuItems: MenuItem[] = [
  {
    label: "Marketplace safety",
    href: "/safety",
    icon: ShieldCheck,
  },
  {
    label: "Help centre",
    href: "/help",
    icon: CircleHelp,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  const [openedAtPathname, setOpenedAtPathname] = useState<string | null>(null);

  const isOpen = openedAtPathname === pathname;

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openButtonRef = useRef<HTMLButtonElement>(null);

  function openMenu() {
    setOpenedAtPathname(pathname);
  }

  function closeMenu() {
    setOpenedAtPathname(null);
  }

  /*
   * Keyboard controls and page scroll locking.
   */
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        openButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button */}

      <button
        ref={openButtonRef}
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu-drawer"
        onClick={openMenu}
        className="
          flex
          size-10
          items-center
          justify-center
          rounded-control
          text-foreground
          transition
          hover:bg-surface-muted
          md:hidden
        "
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      {/* Drawer layer */}

      <div
        className={cn(
          "fixed inset-0 z-60 md:hidden",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Dark overlay */}

        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className={cn(
            "absolute inset-0 bg-black/45 transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Navigation drawer */}

        <aside
          id="mobile-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "absolute inset-y-0 left-0",
            "flex w-[86%] max-w-sm flex-col",
            "bg-surface shadow-xl",
            "transition-transform duration-200 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Drawer header */}

          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2 text-lg font-bold text-primary"
            >
              <ShoppingBag className="size-5" />
              Marketplace
            </Link>

            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMenu}
              className="
                flex
                size-10
                items-center
                justify-center
                rounded-control
                text-foreground
                transition
                hover:bg-surface-muted
              "
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          {/* Account summary */}

          <div className="border-b border-border p-4">
            <Link
              href="/profile"
              onClick={closeMenu}
              className="
                flex
                items-center
                gap-3
                rounded-card
                bg-surface-muted
                p-3
                transition
                hover:bg-primary-soft
              "
            >
              <div
                className="
                  flex
                  size-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-primary
                  text-white
                "
              >
                <UserRound className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  John Doe
                </p>

                <div className="mt-0.5 flex items-center gap-1 text-xs text-secondary">
                  <ShieldCheck className="size-3.5" />
                  Student verified
                </div>
              </div>
            </Link>
          </div>

          {/* Scrollable menu */}

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav aria-label="Main mobile menu" className="space-y-1">
              {mainMenuItems.map((item) => (
                <MobileMenuLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onClick={closeMenu}
                />
              ))}
            </nav>

            {/* Sell action */}

            <Link
              href="/products/new"
              onClick={closeMenu}
              className="
                mt-5
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-control
                bg-primary
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-primary-hover
              "
            >
              <Plus className="size-5" />
              Sell an item
            </Link>

            {/* Support */}

            <div className="mt-6 border-t border-border pt-4">
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                Support
              </p>

              <nav aria-label="Support menu" className="mt-2 space-y-1">
                {supportMenuItems.map((item) => (
                  <MobileMenuLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClick={closeMenu}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Authentication area */}

          <div className="border-t border-border p-4">
            <Link
              href="/login"
              onClick={closeMenu}
              className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-control
                border
                border-border
                bg-surface
                text-sm
                font-semibold
                text-foreground
                transition
                hover:bg-surface-muted
              "
            >
              <LogIn className="size-5" />
              Sign in
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

interface MobileMenuLinkProps {
  item: MenuItem;
  pathname: string;
  onClick: () => void;
}

function MobileMenuLink({ item, pathname, onClick }: MobileMenuLinkProps) {
  const Icon = item.icon;

  const isActive =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-control px-3 py-2",
        "text-sm font-medium transition-colors",

        isActive
          ? "bg-primary-soft text-primary"
          : "text-foreground hover:bg-surface-muted",
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />

      <span>{item.label}</span>
    </Link>
  );
}
