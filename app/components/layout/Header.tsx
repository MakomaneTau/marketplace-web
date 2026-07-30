import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { HeaderIconLink } from "@/app/components/layout/HeaderIconLink";
import { Container } from "@/app/components/layout/Container";
import { MobileNav } from "@/app/components/layout/MobileNav";

export function Header() {
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

          <Link
            href="sell"
            className="
                inline-flex
                h-11
                shrink-0
                items-center
                justify-center
                rounded-control
                bg-primary
                px-4
                text-sm
                font-semibold
                transition
                hover:bg-primary-hover
            "
          >
            Sell an Item
          </Link>
        </div>
      </Container>
    </header>
  );
}
