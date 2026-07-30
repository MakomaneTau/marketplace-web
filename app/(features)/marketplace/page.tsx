"use client";
import { CategoryList } from "@/app/components/home/CategoryList";
import { HeroSection } from "@/app/components/home/HeroSection";
import { HomeSectionHeader } from "@/app/components/home/HomeSectionHeader";

import { Container } from "@/app/components/layout/Container";

import { ProductGrid } from "@/app/components/product/ProductGrid";

import { featuredProducts } from "@/app/data/products";

export default function MarketplacePage() {
return (
    <Container className="py-5 md:py-8 lg:py-10">
      {/* ====================================
          HERO
      ===================================== */}

      <HeroSection />

      {/* ====================================
          CATEGORIES
      ===================================== */}

      <section className="mt-8 md:mt-10">
        <HomeSectionHeader
          title="Browse categories"
          description="Find what you're looking for."
          href="/categories"
        />

        <CategoryList />
      </section>

      {/* ====================================
          LATEST LISTINGS
      ===================================== */}

      <section className="mt-10 md:mt-12">
        <HomeSectionHeader
          title="Latest listings"
          description="Fresh items from the marketplace."
          href="/search?sort=newest"
        />

        <ProductGrid
          products={featuredProducts}
        />
      </section>

      {/* ====================================
          NEAR CAMPUS
      ===================================== */}

      <section className="mt-10 md:mt-12">
        <HomeSectionHeader
          title="Near your campus"
          description="Listings around your university."
          href="/search?nearby=true"
        />

        <ProductGrid
          products={featuredProducts.slice(
            0,
            4,
          )}
        />
      </section>
    </Container>
  );
}