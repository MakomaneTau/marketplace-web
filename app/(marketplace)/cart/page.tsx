"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { apiErrorMessage, apiPublic, apiRequest } from "@/app/libs/api";
import type { ApiProduct } from "@/app/libs/catalog";

type CheckoutProduct = ApiProduct & { allows_delivery: boolean; allows_campus_pickup: boolean };
type PublicShop = { pickup_areas: { campus: { id: string; name: string } }[] };

function CartContent() {
  const productId = useSearchParams().get("product");
  const router = useRouter();
  const [product, setProduct] = useState<CheckoutProduct | null>(null);
  const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
  const [fulfilment, setFulfilment] = useState<"delivery" | "campus_pickup">("delivery");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!productId) return;
    apiPublic<CheckoutProduct>(`/products/${productId}`).then(async (item) => {
      setProduct(item);
      setFulfilment(item.allows_delivery ? "delivery" : "campus_pickup");
      if (item.allows_campus_pickup) {
        const shop = await apiPublic<PublicShop>(`/shops/${item.shop.slug}`);
        setCampuses(shop.pickup_areas.map((area) => area.campus));
      }
    }).catch((requestError) => setError(apiErrorMessage(requestError)));
  }, [productId]);

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    const form = new FormData(event.currentTarget);
    const input = { items: [{ productId: product.id, quantity: Number(form.get("quantity")) }], fulfilmentType: fulfilment, ...(fulfilment === "delivery" ? { deliveryAddress: form.get("deliveryAddress") } : { pickupCampusId: form.get("pickupCampusId"), pickupNotes: form.get("pickupNotes") || null }) };
    try { setBusy(true); await apiRequest("/orders", { method: "POST", auth: true, body: JSON.stringify(input) }); router.push("/orders"); } catch (requestError) { setError(apiErrorMessage(requestError)); } finally { setBusy(false); }
  }

  if (!productId) return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-bold">Your cart is empty</h1><p className="mt-2 text-muted">Choose Buy now on a product to begin checkout.</p></main>;
  if (!product && !error) return <p className="py-16 text-center text-muted">Loading checkout...</p>;
  return <main className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-2xl font-bold">Checkout</h1>{product && <form onSubmit={checkout} className="mt-6 space-y-5 rounded-card border border-border bg-surface p-6"><div><h2 className="font-semibold">{product.title}</h2><p className="text-2xl font-bold text-accent">R{Number(product.price).toFixed(2)}</p></div><label className="block text-sm font-semibold">Quantity<input name="quantity" type="number" min="1" defaultValue="1" className="mt-2 w-full rounded-control border border-border px-4 py-3"/></label><div className="flex gap-4">{product.allows_delivery && <label><input type="radio" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")}/> Delivery</label>}{product.allows_campus_pickup && <label><input type="radio" checked={fulfilment === "campus_pickup"} onChange={() => setFulfilment("campus_pickup")}/> Campus pickup</label>}</div>{fulfilment === "delivery" ? <label className="block text-sm font-semibold">Delivery address<textarea name="deliveryAddress" required rows={3} className="mt-2 w-full rounded-control border border-border px-4 py-3"/></label> : <><label className="block text-sm font-semibold">Pickup campus<select name="pickupCampusId" required className="mt-2 w-full rounded-control border border-border px-4 py-3"><option value="">Select campus</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}</select></label><label className="block text-sm font-semibold">Pickup notes<textarea name="pickupNotes" maxLength={500} rows={2} className="mt-2 w-full rounded-control border border-border px-4 py-3"/></label></>}<button disabled={busy} className="w-full rounded-control bg-primary px-4 py-3 font-semibold text-white">{busy ? "Placing order..." : "Place order"}</button>{error && <p role="alert" className="text-sm text-danger">{error}</p>}</form>}</main>;
}

export default function CartPage() { return <Suspense fallback={<p className="py-16 text-center text-muted">Loading checkout...</p>}><CartContent/></Suspense>; }
