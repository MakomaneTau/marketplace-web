"use client";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { apiPublic } from "@/app/libs/api";
import type { ApiCategory } from "@/app/libs/catalog";

const HOME_CATEGORY_LIMIT = 6;

export function CategoryList() {
  const [categories,setCategories]=useState<ApiCategory[]>([]);
  useEffect(()=>{apiPublic<ApiCategory[]>("/categories?featured=true").then(setCategories).catch(()=>setCategories([]));},[]);
  const homeCategories = categories
    .slice(0, HOME_CATEGORY_LIMIT);

  return (
    <div
      className="
        grid
        grid-cols-3
        gap-3
        sm:grid-cols-6
        md:gap-4
      "
    >
      {homeCategories.map((category) => {
        const Icon = PackageOpen;

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
              rounded-card
              border
              border-border
              bg-surface
              px-2
              py-4
              text-center
              transition
              hover:border-primary/30
              hover:bg-primary-soft
            "
          >
            <span
              className="
                flex
                size-11
                items-center
                justify-center
                rounded-full
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
