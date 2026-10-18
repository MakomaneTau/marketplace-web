"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { apiRequest, apiErrorMessage } from "@/lib/api";
type Product = {
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
  stock_quantity: number;
  image_urls: string[];
};
export default function Preview() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiRequest<Product>(`/seller/products/${id}`, {
      auth: true,
      signal: controller.signal,
    })
      .then(setProduct)
      .catch((e) => {
        if (!controller.signal.aborted) setError(apiErrorMessage(e));
      });
    return () => controller.abort();
  }, [id, attempt]);
  return (
    <main className="mx-auto max-w-4xl space-y-5 py-6">
      <Link href="/seller/products" className="underline">
        Back to products
      </Link>
      <p className="text-sm text-muted">Seller preview</p>
      {error && (
        <p role="alert">
          {error}{" "}
          <button
            onClick={() => {
              setError("");
              setAttempt((a) => a + 1);
            }}
          >
            Retry
          </button>
        </p>
      )}
      {product ? (
        <>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p>
            R{Number(product.price).toFixed(2)} ·{" "}
            {product.condition.replaceAll("_", " ")} · {product.status} ·{" "}
            {product.stock_quantity} in stock
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.image_urls.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={product.title}
                className="aspect-square w-full rounded-card object-cover"
              />
            ))}
          </div>
          <p className="whitespace-pre-wrap">{product.description}</p>
          <Link className="underline" href={`/seller/products/${id}/edit`}>
            Edit listing
          </Link>
        </>
      ) : (
        !error && <LoadingSplash compact label="Loading preview..." />
      )}
    </main>
  );
}
