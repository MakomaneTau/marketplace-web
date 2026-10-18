import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchProductsExplorer } from "@/components/search/SearchProductsExplorer";
import { parseSearch } from "@/components/search/search-model";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Find student marketplace listings by campus, price and collection options.",
};
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined)
      params.set(key, Array.isArray(value) ? value[0] : value);
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <PageHeader
        title="Find your next good find"
        description="Search by campus, budget and how you'd like to collect."
      />
      <section className="mt-8">
        <SearchProductsExplorer
          key={params.toString()}
          initialFilters={parseSearch(params)}
        />
      </section>
    </Container>
  );
}
