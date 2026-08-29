import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { ProductGrid } from "@/app/components/product/ProductGrid";
import {
  mapProduct,
  type ApiCategory,
  type ApiProduct,
} from "@/app/libs/catalog";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function loadCategory(slug: string) {
  const response = await fetch(
    `${API_URL}/api/v1/categories/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Category service unavailable");

  return (await response.json()).data as ApiCategory;
}

async function loadProducts(slug: string) {
  const response = await fetch(
    `${API_URL}/api/v1/products?category=${encodeURIComponent(slug)}&limit=24`,
    { cache: "no-store" },
  );

  if (!response.ok) throw new Error("Product service unavailable");

  const body = await response.json();
  return (body.data as ApiProduct[]).map(mapProduct);
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug).catch(() => null);

  if (!category) return { title: "Category not found" };

  return {
    title: category.name,
    description:
      category.description ||
      `Browse ${category.name.toLowerCase()} available in the marketplace.`,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await loadCategory(slug);

  if (!category) notFound();

  const products = await loadProducts(category.slug);

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <PageHeader
        title={category.name}
        description={
          category.description ||
          `Browse ${category.name.toLowerCase()} available from marketplace sellers.`
        }
      />

      <section className="mt-8">
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No products in this category
            </h2>
            <p className="mt-2 text-sm text-muted">
              Check again later or explore another category.
            </p>
            <Link
              href="/categories"
              className="mt-5 inline-flex rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Browse categories
            </Link>
          </div>
        )}
      </section>
    </Container>
  );
}
