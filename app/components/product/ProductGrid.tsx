"use client";

import { ProductCard } from "@/app/components/product/ProductCard";
import type { Product } from "@/app/types/product";

interface ProductGridProps {
  products: Product[];
  onFavouriteChange?: (productId: string, isFavourite: boolean) => void;
}

export function ProductGrid({ products, onFavouriteChange }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onFavouriteChange={onFavouriteChange}
        />
      ))}
    </div>
  );
}
