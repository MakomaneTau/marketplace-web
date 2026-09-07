"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatZAR } from "@/app/libs/format";
import type { Product } from "@/app/types/product";
import { ApiClientError, apiErrorMessage, apiRequest } from "@/app/libs/api";
import { useAuth } from "@/app/hooks/use-auth";

interface ProductCardProps {
  product: Product;
  onFavouriteChange?: (productId: string, isFavourite: boolean) => void;
}

export function ProductCard({ product, onFavouriteChange }: ProductCardProps) {
  const [isFavourite, setIsFavourite] = useState(Boolean(product.isFavourite));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInRequired, setSignInRequired] = useState(false);
  const router = useRouter();
  const { auth, ready } = useAuth();

  async function toggleFavourite() {
    if (ready && !auth) {
      router.push("/login");
      return;
    }
    if (busy) return;
    const nextValue = !isFavourite;
    setIsFavourite(nextValue);
    setBusy(true);
    setError(null);
    setSignInRequired(false);
    try {
      await apiRequest(`/favourites/${product.id}`, {
        method: nextValue ? "PUT" : "DELETE",
        auth: true,
      });
      onFavouriteChange?.(product.id, nextValue);
    } catch (requestError: unknown) {
      setIsFavourite(!nextValue);
      setError(apiErrorMessage(requestError));
      setSignInRequired(requestError instanceof ApiClientError && requestError.status === 401);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-card bg-surface-muted">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        <button
          type="button"
          aria-label={isFavourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
          aria-pressed={isFavourite}
          onClick={toggleFavourite}
          disabled={busy || !ready}
          className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur transition hover:bg-white"
        >
          <Heart className="size-5" fill={isFavourite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="pt-3">
        {error && (
          <div role="alert" className="mb-2 text-sm text-danger">
            <p>{error}</p>
            {signInRequired && (
              <div className="mt-1 flex flex-wrap gap-3">
                <Link href="/login" className="underline">Sign in</Link>
                <Link href="/" className="underline">Back to marketplace</Link>
              </div>
            )}
          </div>
        )}
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-sm font-medium leading-5 text-foreground md:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-lg font-bold text-accent">{formatZAR(product.price)}</p>
        <div className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
          <span className="truncate">{product.location}</span>
          <span aria-hidden="true">•</span>
          <span className="shrink-0">{product.condition}</span>
        </div>
      </div>
    </article>
  );
}
