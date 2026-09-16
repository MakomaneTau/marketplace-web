"use client";

import { useEffect, useState } from "react";

import { CategoryList } from "@/app/components/home/CategoryList";
import { HeroSection } from "@/app/components/home/HeroSection";
import { HomeSectionHeader } from "@/app/components/home/HomeSectionHeader";
import { Container } from "@/app/components/layout/Container";
import { ProductGrid } from "@/app/components/product/ProductGrid";
import { apiPublic } from "@/app/libs/api";
import { mapProduct, type ApiProduct } from "@/app/libs/catalog";

export default function MarketplacePage() {
  const [products, setProducts] = useState<ReturnType<typeof mapProduct>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiPublic<ApiProduct[]>("/products?sort=newest&limit=8")
      .then((items) => setProducts(items.map(mapProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Container className="pt-5 md:pt-7 lg:pt-8">
        <HeroSection />

        <section className="mt-8 border-b border-border pb-8 md:mt-10">
          <HomeSectionHeader
            title="Browse categories"
            description="Jump straight to what you need."
            href="/categories"
          />
          <CategoryList />
        </section>

        <section className="mt-10 md:mt-12">
          <HomeSectionHeader
            title="Latest listings"
            description="Fresh items from students around you."
            href="/search?sort=newest"
          />
          {loading ? <ProductGridSkeleton /> : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="border-y border-border py-12 text-center">
              <p className="font-semibold text-foreground">No fresh listings yet</p>
              <p className="mt-1 text-sm text-muted">Be the first student to add something useful.</p>
            </div>
          )}
        </section>

        <section className="mt-10 md:mt-12">
          <HomeSectionHeader
            title="Near your campus"
            description="Spend less time arranging collection."
            href="/search?nearby=true"
          />
          {loading ? <ProductGridSkeleton count={4} /> : products.length > 0 ? (
            <ProductGrid products={products.slice(0, 4)} />
          ) : (
            <p className="border-y border-border py-8 text-center text-sm text-muted">
              Nearby listings will appear here as students add them.
            </p>
          )}
        </section>
      </Container>
      <div className="h-12 md:h-16" />
    </>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      aria-label="Loading listings"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-square rounded-card bg-surface-muted" />
          <div className="mt-3 h-4 w-4/5 rounded bg-surface-muted" />
          <div className="mt-2 h-5 w-2/5 rounded bg-surface-muted" />
          <div className="mt-2 h-3 w-3/5 rounded bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}
