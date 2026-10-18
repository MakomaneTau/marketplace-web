"use client";

import { useEffect, useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { useAuth } from "@/hooks/use-auth";
import { apiErrorMessage, apiPublic } from "@/lib/api";
import { mapProduct, type ApiProduct } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CampusSelect } from "@/components/search/CampusSelect";

import { HomeSectionHeader } from "./HomeSectionHeader";

export function CampusListings() {
  const { auth } = useAuth();
  const profileCampus = auth?.profile?.campus as { id?: string } | undefined;
  const [choice, setChoice] = useState<string | null>(null);
  const campus = choice ?? profileCampus?.id ?? "";
  return (
    <section id="campus" className="mt-10 scroll-mt-24 md:mt-12">
      <HomeSectionHeader
        title="Near your campus"
        description="Find sellers who can meet you on campus."
        href={campus ? `/search?campus=${campus}` : undefined}
      />
      <div className="mb-5 max-w-md">
        <CampusSelect value={campus} onChange={setChoice} />
      </div>
      {campus ? (
        <ListingFeed
          key={campus}
          endpoint={`/products?campus=${campus}&limit=4`}
          empty="No listings offer pickup here yet. Try another campus or browse all listings."
        />
      ) : (
        <p className="border-y border-border py-8 text-sm text-muted">
          Choose a campus to see listings with pickup available there.
        </p>
      )}
    </section>
  );
}

export function ListingFeed({
  endpoint,
  empty,
}: {
  endpoint: string;
  empty: string;
}) {
  const [products, setProducts] = useState<ReturnType<typeof mapProduct>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiPublic<ApiProduct[]>(endpoint, { signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) {
          setProducts(items.map(mapProduct));
          setError(null);
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(apiErrorMessage(failure));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint, attempt]);
  if (loading) return <LoadingSplash compact label="Loading listings…" />;
  if (error)
    return (
      <div role="alert" className="border-y border-border py-8 text-center">
        <p className="font-semibold">Listings could not be loaded</p>
        <p className="mt-2 text-sm text-muted">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setAttempt((value) => value + 1);
          }}
          className="mt-3 font-semibold text-primary-text underline"
        >
          Try again
        </button>
      </div>
    );
  return products.length ? (
    <ProductGrid products={products} />
  ) : (
    <p className="border-y border-border py-10 text-center text-sm text-muted">
      {empty}
    </p>
  );
}
