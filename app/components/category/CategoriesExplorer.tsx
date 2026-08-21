"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageOpen, Search, SearchX } from "lucide-react";

import { CategoryCard } from "@/app/components/category/CategoryCard";
import type { Category } from "@/app/data/categories";
import { apiPublic } from "@/app/libs/api";
import type { ApiCategory } from "@/app/libs/catalog";

export function CategoriesExplorer() {
  const [searchQuery, setSearchQuery] =
    useState("");
  const[categories,setCategories]=useState<Category[]>([]);
  useEffect(()=>{apiPublic<ApiCategory[]>("/categories").then(items=>setCategories(items.map(item=>({name:item.name,slug:item.slug,description:item.description,productCount:item.product_count,featured:item.is_featured,icon:PackageOpen})))).catch(()=>setCategories([]));},[]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery
      .trim()
      .toLowerCase();

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name
          .toLowerCase()
          .includes(normalizedQuery) ||
        category.description
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [categories, searchQuery]);

  return (
    <div>
      {/* Search categories */}

      <div className="relative max-w-xl">
        <Search
          aria-hidden="true"
          className="
            absolute
            left-3
            top-1/2
            size-5
            -translate-y-1/2
            text-muted
          "
        />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
          placeholder="Search categories"
          aria-label="Search categories"
          className="
            h-12
            w-full
            rounded-control
            border
            border-border
            bg-surface
            pl-10
            pr-4
            text-sm
            text-foreground
            outline-none
            transition
            placeholder:text-muted
            focus:border-primary
            focus:ring-2
            focus:ring-primary/20
          "
        />
      </div>

      {/* Result count */}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          {filteredCategories.length}{" "}
          {filteredCategories.length === 1
            ? "category"
            : "categories"}
        </p>
      </div>

      {/* Category grid */}

      {filteredCategories.length > 0 ? (
        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-3
            sm:gap-4
            md:grid-cols-3
            lg:grid-cols-4
            lg:gap-6
          "
        >
          {filteredCategories.map(
            (category) => (
              <CategoryCard
                key={category.slug}
                category={category}
              />
            ),
          )}
        </div>
      ) : (
        <div
          className="
            mt-6
            flex
            min-h-64
            flex-col
            items-center
            justify-center
            rounded-card
            border
            border-dashed
            border-border
            bg-surface
            px-6
            text-center
          "
        >
          <span
            className="
              flex
              size-12
              items-center
              justify-center
              rounded-full
              bg-surface-muted
              text-muted
            "
          >
            <SearchX className="size-6" />
          </span>

          <h2 className="mt-4 text-base font-semibold text-foreground">
            No categories found
          </h2>

          <p className="mt-1 max-w-sm text-sm text-muted">
            Try searching for something else,
            such as textbooks, phones or furniture.
          </p>

          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="
              mt-4
              rounded-control
              bg-primary
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-primary-hover
            "
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
