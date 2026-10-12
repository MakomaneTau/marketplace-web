import { apiPublic, apiErrorMessage } from "@/lib/api";
import type { ApiProduct } from "@/lib/catalog";

export type Fulfilment = "delivery" | "campus_pickup";

export type Campus = {
  id: string;
  name: string;
  city?: string | null;
  province?: string | null;
  university?: {
    id: string;
    name: string;
    acronym?: string | null;
    slug: string;
  } | null;
};

export type CheckoutProduct = ApiProduct & {
  allows_delivery: boolean;
  allows_campus_pickup: boolean;
  stock_quantity?: number;
};

export type PublicShop = { pickup_areas?: { campus: Campus }[] };

export const PICKUP_TIME_OPTIONS = Array.from({ length: 29 }, (_, index) => {
  const minutesFromStart = 8 * 60 + index * 30;
  const hours = Math.floor(minutesFromStart / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (minutesFromStart % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
});

export async function fetchCheckoutData(
  productId: string,
  signal?: AbortSignal,
) {
  const item = await apiPublic<CheckoutProduct>(`/products/${productId}`, {
    signal,
  });
  let campuses: Campus[] = [];
  let campusError: string | null = null;

  if (item.allows_campus_pickup) {
    try {
      const shop = await apiPublic<PublicShop>(`/shops/${item.shop.slug}`, {
        signal,
      });
      campuses = (shop.pickup_areas ?? []).map((area) => area.campus);
    } catch (requestError) {
      if (signal?.aborted) throw requestError;
      campusError = apiErrorMessage(requestError);
    }
  }

  return { item, campuses, campusError };
}

export function maximumOrderQuantity(product: CheckoutProduct) {
  return Math.max(1, Math.min(product.stock_quantity ?? 99, 99));
}

export function buildPickupNotes(form: FormData) {
  const preferredBuilding = String(form.get("preferredBuilding") ?? "").trim();
  const preferredTime = String(form.get("preferredTime") ?? "").trim();
  const otherDetails = String(form.get("otherPickupDetails") ?? "").trim();
  const parts = [
    preferredBuilding ? `Preferred building: ${preferredBuilding}` : "",
    preferredTime ? `Preferred time: ${preferredTime}` : "",
    otherDetails ? `Other details: ${otherDetails}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join("\n").slice(0, 500) : null;
}
