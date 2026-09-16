import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CalendarDays, ChevronRight, MapPin, ShieldCheck, Star } from "lucide-react";

import { Container } from "@/app/components/layout/Container";
import { ProductActions } from "@/app/components/product/ProductActions";
import { ProductGallery } from "@/app/components/product/ProductGallery";
import { ProductGrid } from "@/app/components/product/ProductGrid";
import { formatZAR } from "@/app/libs/format";
import { mapProduct, type ApiProduct } from "@/app/libs/catalog";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

type ProductReview = {
  id: string;
  rating: number;
  comment: string;
  reviewer: { display_name: string };
};

const API_URL = process.env.MARKETPLACE_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const listingDateFormatter = new Intl.DateTimeFormat("en-ZA", {
  dateStyle: "medium",
  timeZone: "Africa/Johannesburg",
});

function formatListingDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : listingDateFormatter.format(date);
}

function sellerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";
}

async function loadProduct(reference: string) {
  const usesUuid = UUID_PATTERN.test(reference);
  const endpoint = usesUuid
    ? `/api/v1/products/${reference}`
    : `/api/v1/products?slug=${encodeURIComponent(reference)}&limit=1`;
  const response = await fetch(`${API_URL}${endpoint}`, { cache: "no-store" });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Product service unavailable");

  const body = await response.json();
  const value = usesUuid ? body.data : body.data?.[0];
  return value ? mapProduct(value as ApiProduct) : null;
}

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id).catch(() => null);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  const product = await loadProduct(id).catch(() => null);

  if (!product) notFound();
  if (id !== product.slug) permanentRedirect(`/products/${product.slug}`);

  const [relatedResponse, reviewsResponse] = await Promise.all([
    fetch(`${API_URL}/api/v1/products?shop=${encodeURIComponent(product.seller.shopSlug)}&limit=5`, { cache: "no-store" }).catch(() => null),
    fetch(`${API_URL}/api/v1/products/${product.id}/reviews?limit=5`, { cache: "no-store" }).catch(() => null),
  ]);

  const relatedProducts = relatedResponse?.ok
    ? ((await relatedResponse.json()).data as ApiProduct[])
        .filter((item) => item.id !== product.id)
        .slice(0, 4)
        .map(mapProduct)
    : [];
  const reviews = reviewsResponse?.ok
    ? ((await reviewsResponse.json()).data as ProductReview[])
    : [];

  return (
    <Container className="py-5 md:py-7 lg:py-8">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 overflow-hidden text-sm text-muted">
        <Link href="/" className="shrink-0 font-semibold text-primary hover:underline">Home</Link>
        <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
        <Link href={`/categories/${product.categorySlug}`} className="shrink-0 capitalize hover:text-foreground">
          {product.categorySlug.replaceAll("-", " ")}
        </Link>
        <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate text-foreground" aria-current="page">{product.name}</span>
      </nav>

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:gap-10">
        <ProductGallery productName={product.name} images={product.imageUrls} />

        <section className="min-w-0">
          <p className="text-sm font-semibold capitalize text-secondary">Available now</p>
          <h1 className="mt-2 text-2xl font-black leading-tight text-foreground sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-black text-foreground sm:text-4xl">{formatZAR(product.price)}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-sm text-muted">
            <span className="font-semibold text-foreground">{product.condition} condition</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              Listed <time dateTime={product.createdAt}>{formatListingDate(product.createdAt)}</time>
            </span>
          </div>

          <div className="flex items-start gap-2 border-b border-border py-4">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-foreground">Collection area</p>
              <p className="mt-0.5 text-sm text-muted">{product.location}</p>
            </div>
          </div>

          <div className="py-5">
            <h2 className="text-base font-bold text-foreground">About this item</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted sm:text-base">
              {product.description}
            </p>
          </div>

          <section className="border-y border-border py-4" aria-labelledby="seller-heading">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {sellerInitials(product.seller.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="seller-heading" className="truncate font-bold text-foreground">{product.seller.name}</h2>
                  {product.seller.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                      <ShieldCheck className="size-4" aria-hidden="true" /> Verified student
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 fill-current text-warning" aria-hidden="true" />
                    {product.seller.rating || "New seller"}{product.seller.reviewCount > 0 && ` (${product.seller.reviewCount} reviews)`}
                  </span>
                  <span>Member since {product.seller.memberSince}</span>
                </div>
              </div>
            </div>
          </section>

          <ProductActions
            productId={product.id}
            productName={product.name}
            initialSaved={product.isFavourite}
          />

          <aside className="mt-5 flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold">Meet and pay safely</h2>
              <p className="mt-1 text-xs leading-5 text-emerald-800">
                Meet in a public campus area and inspect the item before completing payment.
              </p>
              <Link href="/safety" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 hover:underline">
                Read the safety guide <ChevronRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-foreground">More from {product.seller.name}</h2>
            <Link href={`/search?shop=${encodeURIComponent(product.seller.shopSlug)}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View shop listings <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5"><ProductGrid products={relatedProducts} /></div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-xl font-black text-foreground">Recent seller reviews</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {reviews.map((review) => (
              <article key={review.id} className="border border-border bg-surface p-5">
                <p className="font-semibold">{review.reviewer.display_name} / {review.rating} out of 5</p>
                <p className="mt-2 text-sm leading-6 text-muted">{review.comment}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
