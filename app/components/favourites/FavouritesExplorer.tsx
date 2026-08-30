"use client";

import Link from "next/link";
import { HeartOff } from "lucide-react";
import { useEffect, useState } from "react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { ProductGrid } from "@/app/components/product/ProductGrid";
import { ApiClientError, apiErrorMessage, apiRequest } from "@/app/libs/api";
import { mapProduct, type ApiProduct } from "@/app/libs/catalog";

export function FavouritesExplorer() {
  const [favourites, setFavourites] = useState<ReturnType<typeof mapProduct>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signInRequired, setSignInRequired] = useState(false);

  useEffect(() => {
    let active = true;

    apiRequest<ApiProduct[]>("/favourites", { auth: true })
      .then((items) => {
        if (active) {
          setFavourites(items.map((item) => ({ ...mapProduct(item), isFavourite: true })));
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setSignInRequired(requestError instanceof ApiClientError && requestError.status === 401);
          setError(apiErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleFavouriteChange(productId: string, isFavourite: boolean) {
    if (!isFavourite) {
      setFavourites((current) => current.filter((product) => product.id !== productId));
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted">Loading saved products...</p>;
  }

  if (error) {
    if (signInRequired) return <ProtectedRequestError message={error} />;
    return (
      <div
        role="alert"
        className="flex min-h-72 flex-col items-center justify-center rounded-card border border-danger/20 bg-red-50 px-6 text-center"
      >
        <HeartOff className="size-8 text-danger" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          {signInRequired ? "Sign in to view your favourites" : "Favourites could not be loaded"}
        </h2>
        <p className="mt-2 max-w-md text-sm text-danger">{error}</p>
        {signInRequired && (
          <Link
            href="/login"
            className="mt-5 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Sign in
          </Link>
        )}
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-muted">
          <HeartOff className="size-7" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-foreground">No saved products</h2>
        <p className="mt-1 max-w-md text-sm text-muted">
          Tap the heart on a product to save it here for later.
        </p>
        <Link href="/search" className="mt-5 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        {favourites.length} saved {favourites.length === 1 ? "product" : "products"}
      </p>
      <ProductGrid products={favourites} onFavouriteChange={handleFavouriteChange} />
    </div>
  );
}
