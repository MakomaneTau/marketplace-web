"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Search, SearchX, SlidersHorizontal } from "lucide-react";

import { ProductGrid } from "@/app/components/product/ProductGrid";
import { categories as localCategories } from "@/app/data/categories";
import { apiErrorMessage, apiPublic } from "@/app/libs/api";
import { mapProduct, type ApiCategory, type ApiProduct } from "@/app/libs/catalog";
import type { ProductCondition } from "@/app/types/product";

export type SortOption = "newest" | "price-low" | "price-high";
export type ConditionFilter = "all" | ProductCondition;

interface SearchProductsExplorerProps {
  initialQuery?: string;
  initialCategory?: string;
  initialShop?: string;
  initialCondition?: ConditionFilter;
  initialSort?: SortOption;
}

const fallbackCategories: ApiCategory[] = localCategories.map((category) => ({
  id: category.slug,
  name: category.name,
  slug: category.slug,
  description: category.description,
  is_featured: Boolean(category.featured),
  product_count: category.productCount,
}));

export function SearchProductsExplorer({
  initialQuery = "",
  initialCategory = "all",
  initialShop = "",
  initialCondition = "all",
  initialSort = "newest",
}: SearchProductsExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState<ConditionFilter>(initialCondition);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [results, setResults] = useState<ReturnType<typeof mapProduct>[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    apiPublic<ApiCategory[]>("/categories")
      .then(setCategories)
      .catch(() => setCategories(fallbackCategories));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (category !== "all") params.set("category", category);
      if (initialShop) params.set("shop", initialShop);
      if (condition !== "all") params.set("condition", condition.toLowerCase().replace(" ", "_"));
      if (sort !== "newest") params.set("sort", sort);

      window.history.replaceState(null, "", params.size > 0 ? `/search?${params}` : "/search");

      const apiParams = new URLSearchParams(params);
      apiParams.set("sort", sort === "price-low" ? "price_asc" : sort === "price-high" ? "price_desc" : "newest");

      setLoading(true);
      setError(null);
      apiPublic<ApiProduct[]>(`/products?${apiParams}`, { signal: controller.signal })
        .then((items) => setResults(items.map(mapProduct)))
        .catch((requestError) => {
          if (requestError instanceof DOMException && requestError.name === "AbortError") return;
          setResults([]);
          setError(apiErrorMessage(requestError));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [category, condition, initialShop, query, retryKey, sort]);

  const filtersActive = Boolean(query.trim()) || category !== "all" || condition !== "all" || sort !== "newest";

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setCondition("all");
    setSort("newest");
  }

  return (
    <div>
      <div className="border-y border-border bg-surface py-4 sm:px-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">Search</span>
            <span className="relative block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Textbooks, laptops, furniture..."
                className="h-11 w-full rounded-control border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>

          <FilterSelect label="Category" value={category} onChange={setCategory}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </FilterSelect>

          <FilterSelect label="Condition" value={condition} onChange={(value) => setCondition(value as ConditionFilter)}>
            <option value="all">Any condition</option>
            <option value="New">New</option>
            <option value="Like new">Like new</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </FilterSelect>

          <FilterSelect label="Sort" value={sort} onChange={(value) => setSort(value as SortOption)}>
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </FilterSelect>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {loading ? "Updating results..." : `${results.length} ${results.length === 1 ? "result" : "results"}`}
        </p>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <RotateCcw className="size-4" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <SearchSkeleton />
      ) : error ? (
        <div className="mt-5 flex min-h-64 flex-col items-center justify-center border-y border-border bg-surface px-6 text-center" role="alert">
          <SearchX className="size-9 text-danger" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-foreground">Listings could not be loaded</h2>
          <p className="mt-1 max-w-md text-sm text-muted">{error}</p>
          <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-4 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            Try again
          </button>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-5"><ProductGrid products={results} /></div>
      ) : (
        <div className="mt-5 flex min-h-64 flex-col items-center justify-center border-y border-border bg-surface px-6 text-center">
          <SearchX className="size-9 text-muted" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-foreground">No products found</h2>
          <p className="mt-1 max-w-md text-sm text-muted">Try a broader search term or remove one of the filters.</p>
          <button type="button" onClick={clearFilters} className="mt-4 rounded-control border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted">
            Reset search
          </button>
        </div>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse border border-border bg-surface">
          <div className="aspect-square bg-surface-muted" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-4/5 rounded bg-surface-muted" />
            <div className="h-5 w-2/5 rounded bg-surface-muted" />
            <div className="h-3 w-3/5 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-control border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {children}
      </select>
    </label>
  );
}
