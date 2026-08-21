"use client";

import Link from "next/link";
import { HeartOff } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductGrid } from "@/app/components/product/ProductGrid";
import { apiRequest } from "@/app/libs/api";
import { mapProduct, type ApiProduct } from "@/app/libs/catalog";

export function FavouritesExplorer() {
  const [favourites, setFavourites] = useState<ReturnType<typeof mapProduct>[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{apiRequest<ApiProduct[]>("/favourites",{auth:true}).then(items=>setFavourites(items.map(item=>({...mapProduct(item),isFavourite:true})))).finally(()=>setLoading(false));},[]);

  function handleFavouriteChange(productId: string, isFavourite: boolean) {
    if (!isFavourite) {
      setFavourites((current) => current.filter((product) => product.id !== productId));
    }
  }

  if(loading)return <p className="py-12 text-center text-sm text-muted">Loading saved products...</p>;
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
