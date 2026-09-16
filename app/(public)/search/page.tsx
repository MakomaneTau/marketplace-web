import type { Metadata } from "next";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import {
  SearchProductsExplorer,
  type ConditionFilter,
  type SortOption,
} from "@/app/components/search/SearchProductsExplorer";

export const metadata: Metadata = {
  title: "Search",
  description: "Search and filter student marketplace products.",
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = first(resolvedSearchParams.q);
  const initialCategory = first(resolvedSearchParams.category) || "all";
  const initialShop = first(resolvedSearchParams.shop);
  const conditionValue = first(resolvedSearchParams.condition);
  const initialCondition: ConditionFilter = ["New", "Like new", "Good", "Fair"].includes(conditionValue)
    ? conditionValue as ConditionFilter
    : "all";
  const sortValue = first(resolvedSearchParams.sort);
  const initialSort: SortOption = ["price-low", "price-high"].includes(sortValue)
    ? sortValue as SortOption
    : "newest";

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <PageHeader
        title="Search marketplace"
        description="Find products by name, category, condition and price order."
      />

      <section className="mt-8">
        <SearchProductsExplorer
          initialQuery={initialQuery}
          initialCategory={initialCategory}
          initialShop={initialShop}
          initialCondition={initialCondition}
          initialSort={initialSort}
        />
      </section>
    </Container>
  );
}
