"use client";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { apiPublic } from "@/app/libs/api";
import { categories as localCategories, getCategoryBySlug } from "@/app/data/categories";
import type { ApiCategory } from "@/app/libs/catalog";

const HOME_CATEGORY_LIMIT = 6;
const fallbackCategories: ApiCategory[] = localCategories
  .filter((category) => category.featured)
  .slice(0, HOME_CATEGORY_LIMIT)
  .map((category) => ({
    id: category.slug,
    name: category.name,
    slug: category.slug,
    description: category.description,
    is_featured: true,
    product_count: category.productCount,
  }));

export function CategoryList() {
  const [categories,setCategories]=useState<ApiCategory[]>(fallbackCategories);
  useEffect(()=>{apiPublic<ApiCategory[]>("/categories?featured=true").then(setCategories).catch(()=>setCategories(fallbackCategories));},[]);
  const homeCategories = categories
    .slice(0, HOME_CATEGORY_LIMIT);

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-card border border-border bg-surface sm:grid-cols-6">
      {homeCategories.map((category) => {
        const Icon = getCategoryBySlug(category.slug)?.icon ?? PackageOpen;

        return (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="
              group
              flex
              min-w-0
              flex-col
              items-center
              gap-2
              border-r
              border-border
              bg-surface
              px-2
              py-5
              text-center
              transition
              hover:bg-primary-soft
            "
          >
            <span
              className="
                flex
                size-11
                items-center
                justify-center
                rounded-control
                bg-surface-muted
                text-foreground
                transition
                group-hover:bg-primary
                group-hover:text-white
              "
            >
              <Icon className="size-5" />
            </span>

            <span className="truncate text-xs font-medium text-foreground sm:text-sm">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
