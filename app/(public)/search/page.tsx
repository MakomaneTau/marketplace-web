import type { Metadata } from "next";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { SearchProductsExplorer } from "@/app/components/search/SearchProductsExplorer";

export const metadata: Metadata = {
  title: "Search",
  description: "Search and filter student marketplace products.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialQuery = Array.isArray(resolvedSearchParams.q)
    ? resolvedSearchParams.q[0] ?? ""
    : resolvedSearchParams.q ?? "";

  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <PageHeader
        title="Search marketplace"
        description="Find products by name, category, condition and price order."
      />

      <section className="mt-8">
        <SearchProductsExplorer initialQuery={initialQuery} />
      </section>
    </Container>
  );
}
