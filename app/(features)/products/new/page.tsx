import type { Metadata } from "next";
import { PlusCircle } from "lucide-react";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { CreateProductForm } from "@/app/components/listing/CreateProductForm";

export const metadata: Metadata = {
  title: "Create listing",
  description: "Create a new marketplace product listing.",
};

export default function CreateProductPage() {
  return (
    <Container className="max-w-4xl py-6 md:py-8 lg:py-10">
      <PageHeader
        icon={PlusCircle}
        title="Create a listing"
        description="Add clear information and photos so buyers understand exactly what you are selling."
      />

      <section className="mt-8">
        <CreateProductForm />
      </section>
    </Container>
  );
}
