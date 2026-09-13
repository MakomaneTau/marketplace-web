"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
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
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? "/images/product-placeholder.svg" : product.imageUrl;
  const isRemoteImage = /^https?:\/\//.test(imageSrc);
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
    <article className="group min-w-0 border border-border bg-surface transition hover:border-border-strong">
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 block"
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            onError={() => setImageFailed(true)}
            unoptimized={isRemoteImage}
          />
        </Link>

        <button
          type="button"
          aria-label={isFavourite ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
          aria-pressed={isFavourite}
          onClick={toggleFavourite}
          disabled={busy || !ready}
          className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full border border-black/5 bg-white/95 text-foreground shadow-sm backdrop-blur transition hover:text-primary"
        >
          <Heart className="size-5" fill={isFavourite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-3">
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
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground md:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-lg font-black text-foreground">{formatZAR(product.price)}</p>
        <div className="mt-2 flex min-w-0 items-center gap-1 text-xs text-muted">
          <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{product.location}</span>
          <span aria-hidden="true">/</span>
          <span className="shrink-0">{product.condition}</span>
        </div>
      </div>
    </article>
  );
}
