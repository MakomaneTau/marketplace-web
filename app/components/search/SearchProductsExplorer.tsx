"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, SearchX } from "lucide-react";

import { ProductGrid } from "@/app/components/product/ProductGrid";
import { categories } from "@/app/data/categories";
import { products } from "@/app/data/products";
import type { ProductCondition } from "@/app/types/product";

interface SearchProductsExplorerProps {
  initialQuery?: string;
}

type SortOption = "newest" | "price-low" | "price-high";
type ConditionFilter = "all" | ProductCondition;

export function SearchProductsExplorer({ initialQuery = "" }: SearchProductsExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState<ConditionFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery);

      const matchesCategory = category === "all" || product.categorySlug === category;
      const matchesCondition = condition === "all" || product.condition === condition;

      return matchesQuery && matchesCategory && matchesCondition;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [category, condition, query, sort]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setCondition("all");
    setSort("newest");
  }

  return (
    <div>
      <div className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-control border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <FilterSelect label="Category" value={category} onChange={setCategory}>
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Condition"
            value={condition}
            onChange={(value) => setCondition(value as ConditionFilter)}
          >
            <option value="all">Any condition</option>
            <option value="New">New</option>
            <option value="Like new">Like new</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </FilterSelect>

          <FilterSelect label="Sort" value={sort} onChange={(value) => setSort(value as SortOption)}>
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </FilterSelect>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <SlidersHorizontal className="size-4" />
          {results.length} {results.length === 1 ? "result" : "results"}
        </div>
        <button type="button" onClick={clearFilters} className="text-sm font-semibold text-primary hover:underline">
          Clear filters
        </button>
      </div>

      {results.length > 0 ? (
        <div className="mt-5">
          <ProductGrid products={results} />
        </div>
      ) : (
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface px-6 text-center">
          <SearchX className="size-10 text-muted" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No products found</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            Try a broader search term or remove one of the filters.
          </p>
          <button type="button" onClick={clearFilters} className="mt-4 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
            Reset search
          </button>
        </div>
      )}
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
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
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
