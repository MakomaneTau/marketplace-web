import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { SearchProductsExplorer } from "@/components/search/SearchProductsExplorer";
import { parseSearch } from "@/components/search/search-model";
import { ShopReviews } from "@/components/shops/ShopReviews";

type Shop = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  rating: number;
  review_count: number;
  pickup_areas: {
    campus: {
      id: string;
      name: string;
      university: { name: string; acronym: string };
    };
  }[];
};
export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const base =
    process.env.MARKETPLACE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:4000";
  const response = await fetch(
    `${base}/api/v1/shops/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (response.status === 404) notFound();
  if (!response.ok)
    throw new Error("The shop could not be loaded. Please try again.");
  const shop = (await response.json()).data as Shop;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams))
    if (value !== undefined)
      query.set(key, Array.isArray(value) ? value[0] : value);
  query.set("shop", slug);
  return (
    <Container className="py-6 md:py-10">
      <Link href="/search" className="text-sm font-semibold text-primary-text">
        ← Browse marketplace
      </Link>
      {shop.banner_url && (
        <div className="relative mt-5 h-40 overflow-hidden rounded-card sm:h-60">
          <Image
            src={shop.banner_url}
            alt={`${shop.name} banner`}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      )}
      <header className="my-8 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          {shop.logo_url && (
            <Image
              src={shop.logo_url}
              alt=""
              width={72}
              height={72}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-black">{shop.name}</h1>
            {shop.tagline && <p className="mt-2 text-muted">{shop.tagline}</p>}
            <p className="mt-2 text-sm">
              {shop.review_count
                ? `${Number(shop.rating).toFixed(1)} / 5 · ${shop.review_count} reviews`
                : "New shop · No reviews yet"}
            </p>
          </div>
        </div>
        {shop.description && (
          <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-6 text-muted">
            {shop.description}
          </p>
        )}
        <h2 className="mt-6 text-sm font-bold">Campus pickup areas</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {shop.pickup_areas.length ? (
            shop.pickup_areas.map(({ campus }) => (
              <Link
                className="rounded-full border border-border px-3 py-2 text-sm hover:border-primary-text"
                key={campus.id}
                href={`/shops/${slug}?campus=${campus.id}`}
              >
                {campus.university.acronym || campus.university.name} ·{" "}
                {campus.name}
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted">
              Ask the seller about collection or delivery.
            </p>
          )}
        </div>
      </header>
      <h2 className="mb-5 text-xl font-bold">Shop listings</h2>
      <SearchProductsExplorer
        key={query.toString()}
        initialFilters={parseSearch(query)}
        fixedShop={slug}
      />
      <ShopReviews slug={slug} />
    </Container>
  );
}
