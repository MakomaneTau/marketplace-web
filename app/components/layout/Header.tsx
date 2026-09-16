"use client";

import { Heart, LogIn, MapPin, Search, ShoppingBag, UserRound } from "lucide-react";
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
  const isSeller = auth?.profile?.role === "seller";
  const accountHref = isSeller ? "/seller" : "/profile";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <Container>
        <div className="grid h-16 min-w-0 grid-cols-3 items-center md:hidden">
          <div className="justify-self-start"><MobileNav /></div>

          <Link href="/" className="justify-self-center text-lg font-black text-foreground">
            Market<span className="text-primary">place</span>
          </Link>

          <Link
            href="/favourites"
            aria-label="Favourites"
            className="
              flex
              size-10
              items-center
              justify-center
              justify-self-end
              rounded-control
              text-foreground
              transition
              hover:bg-surface-muted
            "
          >
            <Heart className="size-5" />
          </Link>
        </div>

        <div className="hidden h-16 items-center justify-between gap-3 md:flex">
          <Link
            href="/"
            className="
              flex
              shrink-0
              items-center
              gap-2
              text-xl
              font-bold
              text-foreground
            "
          >
            <ShoppingBag className="size-6 text-primary" />

            <span>Market<span className="text-primary">place</span></span>
          </Link>

          <form role="search" action="/search" className="relative max-w-xl flex-1">
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
              name="q"
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

          <Link
            href="/search?nearby=true"
            className="hidden h-11 shrink-0 items-center gap-2 rounded-control border border-border px-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted xl:flex"
          >
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            Near campus
          </Link>

          <nav
            aria-label="Buyer Navigation"
            className="flex items-center gap-1"
          >
            <HeaderIconLink href="/favourites" label="Favourites">
              <Heart className="size-5" />
            </HeaderIconLink>

            <HeaderIconLink href="/orders" label="Orders">
              <ShoppingBag className="size-5" />
            </HeaderIconLink>
            <HeaderIconLink href={accountHref} label={isSeller ? "Seller dashboard" : "Profile"}>
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
