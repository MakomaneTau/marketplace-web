import type { Metadata } from "next";
import { Heart } from "lucide-react";

import { FavouritesExplorer } from "@/app/components/favourites/FavouritesExplorer";
import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Favourites",
  description: "View products saved to your marketplace favourites.",
};

export default function FavouritesPage() {
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <PageHeader
        icon={Heart}
        title="Your favourites"
        description="Keep track of products you may want to buy later."
      />

      <section className="mt-8">
        <FavouritesExplorer />
      </section>
    </Container>
  );
}
