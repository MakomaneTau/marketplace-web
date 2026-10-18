import Link from "next/link";

import { CategoryList } from "@/components/home/CategoryList";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { CampusListings, ListingFeed } from "@/components/home/CampusListings";
import { Container } from "@/components/layout/Container";

export default function MarketplacePage() {
  return (
    <Container className="pb-12 pt-5 md:pt-7 lg:pt-8">
      <HeroSection />
      <section className="mt-8 border-b border-border pb-8">
        <HomeSectionHeader
          title="Browse categories"
          description="Jump straight to what you need."
          href="/categories"
        />
        <CategoryList />
      </section>
      <nav aria-label="Quick finds" className="my-8 flex flex-wrap gap-3">
        {[
          ["Under R200", "/search?max_price=200"],
          ["Residence essentials", "/search?q=furniture"],
          ["Textbooks for next semester", "/search?q=textbook"],
          ["New this week", "/search?collection=this-week"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:border-primary-text"
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="mt-8">
        <HomeSectionHeader
          title="Latest listings"
          description="Fresh items from students around you."
          href="/search"
        />
        <ListingFeed
          endpoint="/products?sort=newest&limit=8"
          empty="No fresh listings yet. Check back soon."
        />
      </section>
      <CampusListings />
    </Container>
  );
}
