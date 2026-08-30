"use client";

import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { StatusBadge } from "@/app/components/seller/status-badge";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";
import type { ApiProduct } from "@/app/libs/catalog";

type ListingStatus = "active" | "draft" | "sold" | "paused";
type ProductSort = "newest" | "price_asc" | "price_desc" | "most_viewed";
type SellerProduct = ApiProduct & {
  stock_quantity: number;
  view_count: number;
  status: ListingStatus;
  category: { name: string; slug: string };
};

const statusLabels: Record<ListingStatus, "Active" | "Draft" | "Sold" | "Paused"> = {
  active: "Active", draft: "Draft", sold: "Sold", paused: "Paused",
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [sort, setSort] = useState<ProductSort>("newest");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams({ limit: "100", sort });
    if (search.trim()) params.set("q", search.trim());
    if (status) params.set("status", status);
    setLoading(true);
    setError(null);
    try {
      setProducts(await apiRequest<SellerProduct[]>(`/seller/products?${params}`, { auth: true }));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [search, sort, status]);

  useEffect(() => {
    const timeout = window.setTimeout(loadProducts, 250);
    return () => window.clearTimeout(timeout);
  }, [loadProducts]);

  async function updateStatus(product: SellerProduct, nextStatus: ListingStatus) {
    if (product.status === nextStatus) return;
    setUpdatingId(product.id);
    setError(null);
    try {
      const updated = await apiRequest<SellerProduct>(`/seller/products/${product.id}`, {
        method: "PATCH", auth: true, body: JSON.stringify({ status: nextStatus }),
      });
      setProducts((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteProduct(product: SellerProduct) {
    if (!window.confirm(`Delete “${product.title}”? This cannot be undone.`)) return;
    setUpdatingId(product.id);
    setError(null);
    try {
      await apiRequest<void>(`/seller/products/${product.id}`, { method: "DELETE", auth: true });
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setUpdatingId(null);
    }
  }

  const productMedia = (product: SellerProduct, size: string) => product.image_urls?.[0] ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={product.image_urls[0]} alt="" className={`${size} rounded-xl object-cover`} />
  ) : (
    <span className={`grid ${size} place-items-center rounded-xl bg-slate-100 text-slate-400`}><Package className="h-6 w-6" /></span>
  );

  const productActions = (product: SellerProduct) => (
    <div className="flex items-center justify-end gap-2">
      <select value={product.status} disabled={updatingId === product.id} onChange={(event) => updateStatus(product, event.target.value as ListingStatus)} aria-label={`Change status for ${product.title}`} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 disabled:opacity-50">
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <Link href={`/seller/products/${product.id}/edit`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label={`Edit ${product.title}`}><Pencil className="h-4 w-4" /></Link>
      <button type="button" disabled={updatingId === product.id} onClick={() => deleteProduct(product)} className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label={`Delete ${product.title}`}><Trash2 className="h-4 w-4" /></button>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Inventory" title="Products" description="Create, edit, pause, and track all your marketplace listings." action={<Link href="/seller/products/new" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"><Plus className="h-4 w-4" /> Add product</Link>} />
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <label className="relative flex-1"><span className="sr-only">Search products</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value as ListingStatus | "")} aria-label="Filter by status" className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"><option value="">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={sort} onChange={(event) => setSort(event.target.value as ProductSort)} aria-label="Sort products" className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500"><option value="newest">Newest</option><option value="most_viewed">Most viewed</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
      </div>
      {error && <ProtectedRequestError message={error} />}
      {loading && <p className="text-sm text-slate-500">Loading products...</p>}
      {!loading && !error && products.length === 0 && <div className="rounded-2xl border border-dashed bg-white p-10 text-center"><Package className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold">No products found</p><p className="mt-1 text-sm text-slate-500">Try different filters or add a new listing.</p></div>}
      {!loading && products.length > 0 && <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4 font-semibold">Product</th><th className="px-5 py-4 font-semibold">Price</th><th className="px-5 py-4 font-semibold">Stock</th><th className="px-5 py-4 font-semibold">Views</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{products.map((product) => <tr key={product.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3">{productMedia(product, "h-12 w-12")}<div><p className="font-semibold text-slate-950">{product.title}</p><p className="mt-0.5 text-xs text-slate-500">{product.category.name}</p></div></div></td><td className="px-5 py-4 font-semibold">R{Number(product.price).toFixed(2)}</td><td className="px-5 py-4 text-slate-600">{product.stock_quantity}</td><td className="px-5 py-4 text-slate-600">{product.view_count}</td><td className="px-5 py-4"><StatusBadge status={statusLabels[product.status]} /></td><td className="px-5 py-4">{productActions(product)}</td></tr>)}</tbody></table></div>}
      {!loading && products.length > 0 && <div className="grid gap-4 md:hidden">{products.map((product) => <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex gap-3">{productMedia(product, "h-16 w-16 shrink-0")}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{product.title}</h2><p className="text-xs text-slate-500">{product.category.name}</p></div><StatusBadge status={statusLabels[product.status]} /></div><div className="mt-3 flex items-center justify-between text-sm"><span className="font-bold">R{Number(product.price).toFixed(2)}</span><span className="text-slate-500">Stock {product.stock_quantity} · {product.view_count} views</span></div></div></div><div className="mt-4">{productActions(product)}</div></article>)}</div>}
    </div>
  );
}
