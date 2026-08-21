import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Container } from "@/app/components/layout/Container";
import { ProductGallery } from "@/app/components/product/ProductGallery";
import { ProductGrid } from "@/app/components/product/ProductGrid";
import { ProductActions } from "@/app/components/product/ProductActions";
import { formatZAR } from "@/app/libs/format";
import { mapProduct, type ApiProduct } from "@/app/libs/catalog";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

const API_URL=process.env.NEXT_PUBLIC_API_URL||"http://127.0.0.1:4000";
async function loadProduct(id:string){const response=await fetch(`${API_URL}/api/v1/products/${id}`,{cache:"no-store"});if(response.status===404)return null;if(!response.ok)throw new Error("Product service unavailable");return mapProduct((await response.json()).data as ApiProduct);}

export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id).catch(()=>null);

  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;
  const product = await loadProduct(id).catch(()=>null);

  if (!product) notFound();

  const relatedResponse=await fetch(`${API_URL}/api/v1/products?category=${product.categorySlug}&limit=5`,{cache:"no-store"}).catch(()=>null);const relatedProducts=relatedResponse?.ok?((await relatedResponse.json()).data as ApiProduct[]).filter(item=>item.id!==id).slice(0,4).map(mapProduct):[];

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-12">
        <ProductGallery productName={product.name} images={product.imageUrls} />

        <section>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary capitalize">
                {product.categorySlug}
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {product.name}
              </h1>
            </div>

          </div>

          <p className="mt-4 text-3xl font-bold text-accent">
            {formatZAR(product.price)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface-muted px-3 py-1.5 text-sm font-medium text-foreground">
              {product.condition}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-sm text-muted">
              <MapPin className="size-4" />
              {product.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5 text-sm text-muted">
              <CalendarDays className="size-4" />
              Listed {product.createdAt}
            </span>
          </div>

          <div className="mt-7 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted sm:text-base">
              {product.description}
            </p>
          </div>

          <ProductActions productId={product.id}/>

          <aside className="mt-7 rounded-card border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                NS
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-foreground">
                    {product.seller.name}
                  </h2>
                  {product.seller.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                      <ShieldCheck className="size-4" /> Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {product.seller.campus}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <Star className="size-4 fill-current text-warning" />
                    {product.seller.rating}
                  </span>
                  <span className="text-muted">
                    ({product.seller.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-xl font-bold text-foreground">
            Related products
          </h2>
          <div className="mt-5">
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </Container>
  );
}
