import Link from "next/link";

import { ShoppingBag } from "lucide-react";

import { FaInstagram, FaFacebook } from "react-icons/fa6";

import { Container } from "@/app/components/layout/Container";

import { FooterColumn } from "@/app/components/layout/FooterColumn";

import { SocialLink } from "@/app/components/layout/SocialLink";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div
          className="
            grid
            gap-10
            py-10
            sm:grid-cols-2
            lg:grid-cols-4
            lg:py-14
          "
        >
          {/* Brand */}

          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                text-lg
                font-bold
                text-primary
              "
            >
              <ShoppingBag className="size-5" />
              Marketplace
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
              A simple and trusted marketplace for South African students to buy
              and sell what they need.
            </p>
          </div>

          <FooterColumn
            title="Marketplace"
            links={[
              {
                label: "Browse products",
                href: "/search",
              },
              {
                label: "Sell an item",
                href: "/products/new",
              },
              {
                label: "Categories",
                href: "/categories",
              },
              {
                label: "Favourites",
                href: "/favourites",
              },
            ]}
          />

          <FooterColumn
            title="Support"
            links={[
              {
                label: "Help centre",
                href: "/help",
              },
              {
                label: "Safety",
                href: "/safety",
              },
              {
                label: "Contact us",
                href: "/contact",
              },
              {
                label: "Report a problem",
                href: "/report",
              },
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              {
                label: "Terms of service",
                href: "/terms",
              },
              {
                label: "Privacy policy",
                href: "/privacy",
              },
              {
                label: "Community guidelines",
                href: "/guidelines",
              },
            ]}
          />
        </div>

        {/* Bottom footer */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-border
            py-6
            text-sm
            text-muted
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>© {new Date().getFullYear()} Marketplace. All rights reserved.</p>

          <div className="flex items-center gap-2">
            <SocialLink label="Instagram" href="#">
              <FaInstagram className="size-4" />
            </SocialLink>

            <SocialLink label="Facebook" href="#">
              <FaFacebook className="size-4" />
            </SocialLink>
          </div>
        </div>
      </Container>
    </footer>
  );
}