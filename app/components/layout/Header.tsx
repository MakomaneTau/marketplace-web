"use client";

import { Heart, LogIn, Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HeaderIconLink } from "@/app/components/layout/HeaderIconLink";
import { Container } from "@/app/components/layout/Container";
import { MobileNav } from "@/app/components/layout/MobileNav";
import { useAuth } from "@/app/hooks/use-auth";
import { logout } from "@/app/libs/api";

export function Header() {
  const { auth, ready } = useAuth();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between md:hidden">
          <MobileNav />

          <Link href="/" className="text-lg font-bold text-primary">
            Marketplace
          </Link>

          <Link
            href="/favourites"
            aria-label="Favourites"
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
            <Heart className="size-5" />
          </Link>
        </div>

        <div className="hidden h-16 items-center justify-between gap-flex md:flex">
          <Link
            href="/"
            className="
              flex
              shrink-0
              items-center
              gap-2
              text-xl
              font-bold
              text-primary
            "
          >
            <ShoppingBag className="size-6" />

            <span>Marketplace</span>
          </Link>

          <form role="search" className="relative max-w-2xl flex-1">
            <Search
              aria-hidden="true"
              className="
                    absolute
                    left-3
                    top-1/2
                    size-5
                    -translate-y-1/2
                    text-muted
                "
            />

            <input
              type="search"
              placeholder="Search textbooks, electronics, furniture..."
              className="
                h-11
                w-full
                rounded-control
                border
                border-border
                bg-background
                pl-10
                pr-4
                text-sm
                text-foreground
                outline-none
                transition
                placeholder:text-muted
                focus:border-primary
                focus:ring-2
                focus:ring-primary/20
              "
            />
          </form>

          <nav
            aria-label="Buyer Navigation"
            className="flex items-center gap-1"
          >
            <HeaderIconLink href="/favourites" label="Favourites">
              <Heart className="size-5" />
            </HeaderIconLink>

            <HeaderIconLink href="/cart" label="Cart">
              <ShoppingBag className="size-5" />
            </HeaderIconLink>
            <HeaderIconLink href="/profile" label="Profile">
              <UserRound className="size-5" />
            </HeaderIconLink>
          </nav>

          {ready && auth ? (
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/login");
                router.refresh();
              }}
              className="
                inline-flex
                h-11
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-control
                text-red-600
                px-4
                text-sm
                font-semibold
                transition
                hover:bg-red-600
                hover:text-white
            "
            >
              <LogIn className="size-5" />
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="
                inline-flex 
                h-11 
                shrink-0 
                items-center 
                justify-center 
                gap-2 
                rounded-control 
                bg-primary 
                text-white
                px-4 
                text-sm 
                font-semibold 
                transition 
                hover:bg-primary-hover"
            >
              <LogIn className="size-5" />
              Sign In
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}
