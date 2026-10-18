"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { SavedSearchControl } from "@/components/community/SavedSearchControl";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  apiErrorMessage,
  apiPage,
  apiPublic,
  type PaginationMeta,
} from "@/lib/api";
import { mapProduct, type ApiCategory, type ApiProduct } from "@/lib/catalog";

import { CampusSelect } from "./CampusSelect";
import {
  parseSearch,
  priceError,
  searchParams,
  type SearchFilters,
} from "./search-model";

export function SearchProductsExplorer({
  initialFilters,
  fixedShop,
}: {
  initialFilters: SearchFilters;
  fixedShop?: string;
}) {
  const pathname = usePathname();
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState(initialFilters);
  const [products, setProducts] = useState<ReturnType<typeof mapProduct>[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoryError, setCategoryError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiPublic<ApiCategory[]>("/categories", { signal: controller.signal })
      .then((data) => {
        setCategories(data);
        setCategoryError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setCategoryError(true);
      });
    const restore = () => {
      const value = parseSearch(new URLSearchParams(window.location.search));
      if (fixedShop) value.shop = fixedShop;
      setLoading(true);
      setFilters(value);
      setDraft(value);
      setFormError(null);
    };
    window.addEventListener("popstate", restore);
    return () => {
      controller.abort();
      window.removeEventListener("popstate", restore);
    };
  }, [fixedShop, retry]);
  useEffect(() => {
    const controller = new AbortController();
    const params = searchParams(filters);
    if (fixedShop) params.set("shop", fixedShop);
    params.set("limit", "24");
    apiPage<ApiProduct>("/products?" + params, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setProducts(result.data.map(mapProduct));
        setMeta(result.meta);
        setError(null);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(apiErrorMessage(failure));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filters, fixedShop, retry]);
  function navigate(value: SearchFilters) {
    setLoading(true);
    setError(null);
    setFormError(null);
    setFilters(value);
    setDraft(value);
    const params = searchParams(value);
    if (fixedShop) params.delete("shop");
    window.history.pushState(
      null,
      "",
      pathname + (params.size ? "?" + params : ""),
    );
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const invalid = priceError(draft);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    navigate({ ...draft, q: draft.q.trim(), page: 1 });
  }
  const update = (key: keyof SearchFilters, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const clear = () =>
    navigate({ ...parseSearch(new URLSearchParams()), shop: fixedShop || "" });
  return (
    <div>
      {categoryError && (
        <p role="alert" className="mb-3 text-sm text-danger">
          Category filters could not be loaded.{" "}
          <button
            className="underline"
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry
          </button>
        </p>
      )}
      <form
        onSubmit={submit}
        className="border-y border-border bg-surface py-5 sm:px-5"
      >
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.collection === "this-week"}
            onChange={(event) =>
              update("collection", event.target.checked ? "this-week" : "")
            }
          />
          Listed this week
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold">
            Search
            <input
              type="search"
              value={draft.q}
              maxLength={100}
              onChange={(event) => update("q", event.target.value)}
              placeholder={
                fixedShop
                  ? "Search this shop"
                  : "Textbooks, laptops, furniture…"
              }
              className="mt-1.5 h-11 w-full rounded-control border border-border bg-background px-3 font-normal"
            />
          </label>
          <Select
            label="Category"
            value={draft.category}
            onChange={(value) => update("category", value)}
          >
            <option value="">All categories</option>
            {draft.category &&
              !categories.some((item) => item.slug === draft.category) && (
                <option value={draft.category}>
                  {draft.category.replaceAll("-", " ")}
                </option>
              )}
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select
            label="Condition"
            value={draft.condition}
            onChange={(value) => update("condition", value)}
          >
            <option value="">Any condition</option>
            <option value="new">New</option>
            <option value="like_new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </Select>
          <Select
            label="Sort"
            value={draft.sort}
            onChange={(value) => update("sort", value)}
          >
            <option value="newest">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="most_viewed">Most viewed</option>
          </Select>
          <CampusSelect
            value={draft.campus}
            onChange={(value) => update("campus", value)}
          />
          <Select
            label="Collection or delivery"
            value={draft.fulfilment}
            onChange={(value) => update("fulfilment", value)}
          >
            <option value="">Either</option>
            <option value="campus_pickup">Campus pickup</option>
            <option value="delivery">Delivery available</option>
          </Select>
          {(["min_price", "max_price"] as const).map((field) => (
            <label key={field} className="text-sm font-semibold">
              {field === "min_price"
                ? "Minimum price (R)"
                : "Maximum price (R)"}
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft[field]}
                onChange={(event) => update(field, event.target.value)}
                className="mt-1.5 h-11 w-full rounded-control border border-border bg-background px-3 font-normal"
                placeholder={field === "min_price" ? "0" : "No limit"}
              />
            </label>
          ))}
        </div>
        {formError && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {formError}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button className="rounded-control bg-primary-action px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Find listings
          </button>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-primary-text underline"
          >
            Clear filters
          </button>
          {draft.campus && (
            <p className="text-xs text-muted">
              Showing shops offering pickup at this campus.
            </p>
          )}
        </div>
      </form>
      <SavedSearchControl filters={filters} />
      <p aria-live="polite" className="my-5 text-sm text-muted">
        {loading
          ? "Loading listings…"
          : error
            ? "Results unavailable"
            : (meta?.total || 0) + " matching listings"}
      </p>
      {loading ? (
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          aria-busy="true"
          aria-label="Loading listings"
        >
          <div className="col-span-full">
            <LoadingSplash compact label="Loading listings…" />
          </div>
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse motion-reduce:animate-none rounded-card bg-surface-muted"
            />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="border-y border-border py-10 text-center">
          <h2 className="font-bold">Listings could not be loaded</h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button
            className="mt-4 font-semibold text-primary-text underline"
            onClick={() => {
              setLoading(true);
              setRetry((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className="border-y border-border py-12 text-center">
          <h2 className="text-lg font-bold">No matching listings</h2>
          <p className="mt-2 text-sm text-muted">
            Try a wider price range, another campus, or fewer filters.
          </p>
          <button
            onClick={clear}
            className="mt-4 font-semibold text-primary-text underline"
          >
            Reset search
          </button>
        </div>
      )}
      {!loading &&
        !error &&
        meta &&
        (meta.totalPages > 1 || filters.page > 1) && (
          <nav
            aria-label="Listing pages"
            className="mt-6 flex items-center justify-between gap-4"
          >
            <button
              disabled={filters.page <= 1}
              onClick={() => navigate({ ...filters, page: filters.page - 1 })}
              className="rounded-control border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted">
              Page {filters.page} of {Math.max(1, meta.totalPages)}
            </span>
            <button
              disabled={filters.page >= meta.totalPages}
              onClick={() => navigate({ ...filters, page: filters.page + 1 })}
              className="rounded-control border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
    </div>
  );
}
function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-control border border-border bg-background px-3 font-normal"
      >
        {children}
      </select>
    </label>
  );
}
