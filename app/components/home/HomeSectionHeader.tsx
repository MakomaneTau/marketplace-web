import Link from "next/link";

import { ChevronRight } from "lucide-react";

interface HomeSectionHeaderProps {
  title: string;
  description?: string;
  href?: string;
}

export function HomeSectionHeader({
  title,
  description,
  href,
}: HomeSectionHeaderProps) {
  return (
    <div
      className="
        mb-4
        flex
        items-end
        justify-between
        gap-4
      "
    >
      <div>
        <h2
          className="
            text-lg
            font-bold
            text-foreground
            sm:text-xl
          "
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-muted">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="
            flex
            shrink-0
            items-center
            text-sm
            font-semibold
            text-primary
            hover:underline
          "
        >
          See all

          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}