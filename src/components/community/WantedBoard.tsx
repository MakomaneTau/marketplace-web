"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { apiRequest, apiErrorMessage } from "@/lib/api";
import { CampusSelect } from "@/components/search/CampusSelect";

type Product = {
  id: string;
  title: string;
  slug: string;
  status: string;
  price: number;
};
type Post = {
  id: string;
  title: string;
  details: string;
  budget: number;
  status: string;
  expires_at: string;
  canClose: boolean;
  campus: { name: string } | null;
  replies: { id: string; product: Product | null }[];
};
const field = "w-full rounded-control border border-border bg-surface p-3";
export function WantedBoard({ seller = false }: { seller?: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]),
    [products, setProducts] = useState<Product[]>([]),
    [campus, setCampus] = useState("");
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const data = await apiRequest<Post[]>("/wanted", { auth: true });
      setPosts(data);
      if (seller)
        setProducts(
          await apiRequest<Product[]>(
            "/seller/products?limit=100&status=active",
            { auth: true },
          ),
        );
      setError("");
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [seller]);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initial);
  }, [load]);
  async function mutate(path: string, body: unknown, method = "POST") {
    setBusy(true);
    setError("");
    try {
      await apiRequest(path, {
        auth: true,
        method,
        body: JSON.stringify(body),
      });
      await load();
      return true;
    } catch (e) {
      setError(apiErrorMessage(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function post(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    if (
      await mutate("/wanted", {
        title: data.get("title"),
        details: data.get("details"),
        budget: Number(data.get("budget")),
        campusId: campus || undefined,
      })
    ) {
      form.reset();
      setCampus("");
    }
  }
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">Wanted on campus</h1>
        <p className="mt-2 text-muted">
          {seller
            ? "Match student requests with an active listing from your shop."
            : "Tell sellers what you are looking for. Requests stay open for 30 days."}
        </p>
      </header>
      {!seller && (
        <details className="rounded-card border border-border p-5">
          <summary className="cursor-pointer font-semibold">
            Post a request
          </summary>
          <form onSubmit={post} className="mt-4 grid gap-4">
            <label>
              What do you need?
              <input
                className={field}
                name="title"
                required
                minLength={5}
                maxLength={100}
              />
            </label>
            <label>
              Details
              <textarea
                className={field}
                name="details"
                required
                minLength={10}
                maxLength={1000}
              />
            </label>
            <label>
              Maximum budget (R)
              <input
                className={field}
                name="budget"
                type="number"
                required
                min="0.01"
                step="0.01"
                max="9999999999.99"
              />
            </label>
            <CampusSelect value={campus} onChange={setCampus} />
            <button disabled={busy} className={field}>
              Publish request
            </button>
          </form>
        </details>
      )}
      {error && (
        <p role="alert">
          {error}{" "}
          <button onClick={() => void load()} className="underline">
            Retry
          </button>
        </p>
      )}
      {loading ? (
        <LoadingSplash compact label="Loading requests..." />
      ) : posts.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        posts.map((post) => (
          <article
            key={post.id}
            className="space-y-3 border-b border-border pb-6"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <span>Up to R{Number(post.budget).toFixed(2)}</span>
            </div>
            <p className="whitespace-pre-wrap">{post.details}</p>
            <p className="text-sm text-muted">
              {post.campus?.name || "Any campus"} · {post.status} · Expires{" "}
              {new Date(post.expires_at).toLocaleDateString()}
            </p>
            {post.replies.map(
              (reply) =>
                reply.product && (
                  <p key={reply.id}>
                    Suggested:{" "}
                    <Link
                      className="underline"
                      href={
                        seller
                          ? `/seller/products/${reply.product.id}/preview`
                          : `/products/${reply.product.slug}`
                      }
                    >
                      {reply.product.title}
                    </Link>{" "}
                    · R{Number(reply.product.price).toFixed(2)}
                  </p>
                ),
            )}
            {post.canClose && post.status === "open" && (
              <button
                disabled={busy}
                onClick={() => void mutate(`/wanted/${post.id}`, {}, "PATCH")}
                className="underline"
              >
                Close request
              </button>
            )}
            {seller &&
              post.status === "open" &&
              new Date(post.expires_at) > new Date() && (
                <form
                  className="flex flex-wrap gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void mutate(`/wanted/${post.id}/replies`, {
                      productId: new FormData(event.currentTarget).get(
                        "product",
                      ),
                    });
                  }}
                >
                  <label className="flex-1">
                    Your matching listing
                    <select name="product" required className={field}>
                      <option value="">Select an active product</option>
                      {products.map((product) => (
                        <option value={product.id} key={product.id}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    disabled={busy || !products.length}
                    className="underline"
                  >
                    Suggest listing
                  </button>
                </form>
              )}
          </article>
        ))
      )}
    </main>
  );
}
