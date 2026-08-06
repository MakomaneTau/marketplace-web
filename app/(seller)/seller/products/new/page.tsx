import { ProductForm } from "@/app/components/seller/product-form";
import { SectionHeading } from "@/app/components/seller/section-heading";

export default function NewSellerProductPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="New listing"
        title="Add a product"
        description="Give buyers enough detail to understand the item and arrange a safe purchase."
      />
      <ProductForm />
    </div>
  );
}
