import type { ApiProduct } from "@/lib/catalog";

export type ProductFormProps = {
  mode?: "create" | "edit";
  productId?: string;
};

export type ManagedProduct = ApiProduct & {
  category_id: string;
  stock_quantity: number;
  pickup_location: string | null;
  allows_campus_pickup: boolean;
  allows_delivery: boolean;
  status: string;
};
