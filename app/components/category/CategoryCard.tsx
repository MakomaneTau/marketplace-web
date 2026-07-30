import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Category } from "@/app/data/categories";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({
  category,
}: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="
        group
        flex
        min-w-0
        flex-col
        rounded-card
        border
        border-border
        bg-surface
        p-4
        transition
        hover:-translate-y-0.5
        hover:border-primary/40
        hover:shadow-md
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="
            flex
            size-11
            shrink-0
            items-center
            justify-center
            rounded-card
            bg-primary-soft
            text-primary
            transition
            group-hover:bg-primary
            group-hover:text-white
          "
        >
          <Icon
            aria-hidden="true"
            className="size-5"
          />
        </span>

        {category.featured && (
          <span
            className="
              rounded-full
              bg-secondary-soft
              px-2.5
              py-1
              text-[11px]
              font-semibold
              text-secondary
            "
          >
            Popular
          </span>
        )}
      </div>

      <div className="mt-4 flex-1">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          {category.name}
        </h2>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted sm:text-sm">
          {category.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">
          {category.productCount} listings
        </span>

        <span
          className="
            flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-primary
          "
        >
          Browse

          <ArrowRight
            aria-hidden="true"
            className="
              size-4
              transition-transform
              group-hover:translate-x-1
            "
          />
        </span>
      </div>
    </Link>
  );
}