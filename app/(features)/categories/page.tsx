import type { Metadata } from "next";

import {
  Grid2X2,
  ShieldCheck,
} from "lucide-react";

import { CategoriesExplorer } from "@/app/components/category/CategoriesExplorer";
import { Container } from "@/app/components/layout/Container";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse student marketplace categories including textbooks, electronics, furniture and clothing.",
};

export default function CategoriesPage() {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      {/* Page heading */}

      <section>
        <div
          className="
            flex
            size-12
            items-center
            justify-center
            rounded-card
            bg-primary-soft
            text-primary
          "
        >
          <Grid2X2 className="size-6" />
        </div>

        <h1
          className="
            mt-4
            text-2xl
            font-bold
            text-foreground
            sm:text-3xl
          "
        >
          Browse categories
        </h1>

        <p
          className="
            mt-2
            max-w-2xl
            text-sm
            leading-6
            text-muted
            sm:text-base
          "
        >
          Explore products by category and find
          useful items being sold around your
          university community.
        </p>
      </section>

      {/* Trust notice */}

      <section
        className="
          mt-6
          flex
          max-w-2xl
          items-start
          gap-3
          rounded-card
          border
          border-primary/20
          bg-primary-soft
          p-4
        "
      >
        <ShieldCheck
          aria-hidden="true"
          className="
            mt-0.5
            size-5
            shrink-0
            text-primary
          "
        />

        <div>
          <p className="text-sm font-semibold text-foreground">
            Shop more confidently
          </p>

          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
            Check product details, seller profiles
            and pickup information before agreeing
            to a purchase.
          </p>
        </div>
      </section>

      {/* Search and category cards */}

      <section className="mt-8 md:mt-10">
        <CategoriesExplorer />
      </section>
    </Container>
  );
}