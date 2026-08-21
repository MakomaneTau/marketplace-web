import { redirect } from "next/navigation";

export default function LegacyNewProductPage() {
  redirect("/seller/products/new");
}
