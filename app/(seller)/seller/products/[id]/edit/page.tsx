import { ProductForm } from "@/app/components/seller/product-form";
import { SectionHeading } from "@/app/components/seller/section-heading";

type EditSellerProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSellerProductPage({ params }: EditSellerProductPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Inventory"
        title="Edit product"
        description="Update the listing information buyers see in the marketplace."
      />
      <ProductForm mode="edit" productId={id} />
    </div>
  );
}
