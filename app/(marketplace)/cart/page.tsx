"use client";

import {
  ArrowLeft,
  Building2,
  Check,
  LockKeyhole,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { Container } from "@/app/components/layout/Container";
import { apiErrorMessage, apiPublic, apiRequest, SESSION_ERROR_MESSAGE } from "@/app/libs/api";
import type { ApiProduct } from "@/app/libs/catalog";

type Fulfilment = "delivery" | "campus_pickup";
type Campus = { id: string; name: string };
type CheckoutProduct = ApiProduct & {
  allows_delivery: boolean;
  allows_campus_pickup: boolean;
  stock_quantity?: number;
};
type PublicShop = { pickup_areas?: { campus: Campus }[] };

async function fetchCheckoutData(productId: string, signal?: AbortSignal) {
  const item = await apiPublic<CheckoutProduct>(`/products/${productId}`, { signal });
  let campuses: Campus[] = [];
  let campusError: string | null = null;

  if (item.allows_campus_pickup) {
    try {
      const shop = await apiPublic<PublicShop>(`/shops/${item.shop.slug}`, { signal });
      campuses = (shop.pickup_areas ?? []).map((area) => area.campus);
    } catch (requestError) {
      if (signal?.aborted) throw requestError;
      campusError = apiErrorMessage(requestError);
    }
  }

  return { item, campuses, campusError };
}

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value);
}

function CheckoutSkeleton() {
  return (
    <Container className="py-8 sm:py-12">
      <div className="h-4 w-36 animate-pulse rounded bg-surface-muted" />
      <div className="mt-8 h-9 w-72 animate-pulse rounded bg-surface-muted" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-[34rem] animate-pulse rounded-card border border-border bg-surface" />
        <div className="h-80 animate-pulse rounded-card border border-border bg-surface" />
      </div>
    </Container>
  );
}

function EmptyCheckout() {
  return (
    <Container className="grid min-h-[60vh] place-items-center py-12">
      <section className="max-w-md text-center" aria-labelledby="empty-checkout-title">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <PackageCheck className="size-7" aria-hidden="true" />
        </span>
        <h1 id="empty-checkout-title" className="mt-5 text-2xl font-bold">Your checkout is empty</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Choose Buy now on a listing when you are ready to arrange collection or delivery.
        </p>
        <Link href="/search" className="mt-6 inline-flex h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover">
          Browse listings
        </Link>
      </section>
    </Container>
  );
}

function CartContent() {
  const productId = useSearchParams().get("product");
  const router = useRouter();
  const [product, setProduct] = useState<CheckoutProduct | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState<string | null>(null);
  const [campusError, setCampusError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    void fetchCheckoutData(productId, controller.signal)
      .then(({ item, campuses: availableCampuses, campusError: pickupError }) => {
        setProduct(item);
        setCampuses(availableCampuses);
        setCampusError(pickupError);
        setFulfilment(item.allows_campus_pickup ? "campus_pickup" : "delivery");
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(apiErrorMessage(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [productId]);

  async function retryLoad() {
    if (!productId) return;
    setLoading(true);
    setError(null);
    setCampusError(null);
    try {
      const { item, campuses: availableCampuses, campusError: pickupError } = await fetchCheckoutData(productId);
      setProduct(item);
      setCampuses(availableCampuses);
      setCampusError(pickupError);
      setFulfilment(item.allows_campus_pickup ? "campus_pickup" : "delivery");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product || busy) return;
    const form = new FormData(event.currentTarget);
    const input = {
      items: [{ productId: product.id, quantity }],
      fulfilmentType: fulfilment,
      ...(fulfilment === "delivery"
        ? { deliveryAddress: String(form.get("deliveryAddress") ?? "").trim() }
        : {
            pickupCampusId: String(form.get("pickupCampusId") ?? ""),
            pickupNotes: String(form.get("pickupNotes") ?? "").trim() || null,
          }),
    };

    try {
      setBusy(true);
      setError(null);
      await apiRequest("/orders", {
        method: "POST",
        auth: true,
        body: JSON.stringify(input),
      });
      router.push("/orders?placed=1");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (!productId) return <EmptyCheckout />;
  if (loading) return <CheckoutSkeleton />;
  if (error === SESSION_ERROR_MESSAGE) {
    return <Container className="py-8"><ProtectedRequestError message={error} /></Container>;
  }
  if (!product) {
    return (
      <Container className="grid min-h-[55vh] place-items-center py-12">
        <section className="max-w-md text-center" role="alert">
          <h1 className="text-2xl font-bold">Checkout could not be loaded</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{error ?? "This product is no longer available."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void retryLoad()}
              className="rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link href="/search" className="rounded-control border border-border-strong bg-white px-5 py-2.5 text-sm font-semibold">Browse listings</Link>
          </div>
        </section>
      </Container>
    );
  }

  const unitPrice = Number(product.price);
  const subtotal = unitPrice * quantity;
  const maximumQuantity = Math.max(1, Math.min(product.stock_quantity ?? 99, 99));
  const hasFulfilment = product.allows_delivery || product.allows_campus_pickup;
  const pickupUnavailable = fulfilment === "campus_pickup" && product.allows_campus_pickup && !campuses.length;
  const productHref = `/products/${product.slug || product.id}`;

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
        <Link href={productHref} className="hover:text-primary">Product</Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">Checkout</span>
      </nav>

      <header className="mt-7">
        <h1 className="text-3xl font-bold">Review your order</h1>
        <p className="mt-2 text-muted">Confirm the item and choose how you will get it.</p>
      </header>

      <form onSubmit={checkout} className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
          <section aria-labelledby="item-details-title">
            <h2 id="item-details-title" className="text-lg font-bold">1. Item details</h2>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-control bg-surface-muted sm:h-28 sm:w-28">
                <Image src={product.image_urls?.[0] || "/images/product-placeholder.svg"} alt="" fill sizes="112px" className="object-cover" />
              </div>
              <div className="min-w-[12rem] flex-1">
                <h3 className="font-semibold text-foreground">{product.title}</h3>
                <p className="mt-1 text-sm text-muted">Sold by {product.shop.name}</p>
                <p className="mt-3 text-sm">
                  <span className="text-muted">Condition</span><br />
                  <span className="capitalize">{product.condition.replaceAll("_", " ")}</span>
                </p>
              </div>
              <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:block sm:text-right">
                <p className="text-lg font-bold">{money(unitPrice)}</p>
                <div className="inline-grid grid-cols-[2.5rem_3rem_2.5rem] overflow-hidden rounded-control border border-border-strong sm:mt-4" aria-label="Quantity">
                  <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity === 1} aria-label="Decrease quantity" className="grid h-10 place-items-center bg-white hover:bg-surface-muted disabled:opacity-40"><Minus className="size-4" aria-hidden="true" /></button>
                  <output aria-live="polite" className="grid h-10 place-items-center border-x border-border text-sm font-semibold">{quantity}</output>
                  <button type="button" onClick={() => setQuantity((value) => Math.min(maximumQuantity, value + 1))} disabled={quantity === maximumQuantity} aria-label="Increase quantity" className="grid h-10 place-items-center bg-white hover:bg-surface-muted disabled:opacity-40"><Plus className="size-4" aria-hidden="true" /></button>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="fulfilment-title" className="mt-7 border-t border-border pt-6">
            <h2 id="fulfilment-title" className="text-lg font-bold">2. How will you get it?</h2>
            <p className="mt-1 text-sm text-muted">Choose an option offered by this seller.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.allows_campus_pickup && (
                <label className={`flex cursor-pointer gap-3 rounded-control border p-4 transition ${fulfilment === "campus_pickup" ? "border-primary bg-primary-soft" : "border-border-strong hover:border-primary"}`}>
                  <input type="radio" name="fulfilment" value="campus_pickup" checked={fulfilment === "campus_pickup"} onChange={() => setFulfilment("campus_pickup")} className="mt-1 accent-primary" />
                  <Building2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <span><strong className="block text-sm">Campus pickup</strong><span className="mt-1 block text-xs leading-5 text-muted">Meet on campus with no delivery fee.</span></span>
                </label>
              )}
              {product.allows_delivery && (
                <label className={`flex cursor-pointer gap-3 rounded-control border p-4 transition ${fulfilment === "delivery" ? "border-primary bg-primary-soft" : "border-border-strong hover:border-primary"}`}>
                  <input type="radio" name="fulfilment" value="delivery" checked={fulfilment === "delivery"} onChange={() => setFulfilment("delivery")} className="mt-1 accent-primary" />
                  <Truck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <span><strong className="block text-sm">Delivery</strong><span className="mt-1 block text-xs leading-5 text-muted">Arrange delivery to your address.</span></span>
                </label>
              )}
            </div>

            {!hasFulfilment && <p role="alert" className="mt-4 rounded-control border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">This seller has not enabled a fulfilment option for the item.</p>}

            {fulfilment === "delivery" && product.allows_delivery ? (
              <label className="mt-5 block text-sm font-semibold">Delivery address
                <textarea name="deliveryAddress" required maxLength={500} rows={4} autoComplete="street-address" placeholder="Street address, suburb, city and postal code" className="mt-2 w-full resize-y rounded-control border border-border-strong bg-white px-4 py-3 font-normal outline-none placeholder:text-subtle focus:border-primary" />
              </label>
            ) : product.allows_campus_pickup ? (
              <div className="mt-5 grid gap-4">
                <label className="block text-sm font-semibold">Pickup campus
                  <select name="pickupCampusId" required disabled={pickupUnavailable} className="mt-2 w-full rounded-control border border-border-strong bg-white px-4 py-3 font-normal outline-none focus:border-primary disabled:bg-surface-muted">
                    <option value="">{pickupUnavailable ? "No pickup campuses available" : "Select campus"}</option>
                    {campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold">Meetup notes <span className="font-normal text-muted">(optional)</span>
                  <textarea name="pickupNotes" maxLength={500} rows={3} placeholder="Preferred building, time, or other details" className="mt-2 w-full resize-y rounded-control border border-border-strong bg-white px-4 py-3 font-normal outline-none placeholder:text-subtle focus:border-primary" />
                </label>
                {campusError && <p role="alert" className="text-sm text-danger">Pickup locations could not be loaded. {campusError}</p>}
              </div>
            ) : null}
          </section>

          <aside className="mt-6 flex gap-3 rounded-control border border-blue-200 bg-primary-soft p-4 text-sm">
            <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <strong>Stay safe when meeting</strong>
              <p className="mt-1 leading-5 text-muted">Meet in a public place and do not share sensitive personal information.</p>
              <Link href="/safety" className="mt-2 inline-flex font-semibold text-primary hover:underline">Read safety tips</Link>
            </div>
          </aside>
        </div>

        <aside className="rounded-card border border-border bg-surface p-5 lg:sticky lg:top-24" aria-labelledby="order-summary-title">
          <h2 id="order-summary-title" className="text-lg font-bold">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted">Item subtotal</dt><dd className="font-medium">{money(subtotal)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-muted">Delivery</dt><dd className="font-medium">To be arranged</dd></div>
            <div className="flex justify-between gap-4 border-t border-border pt-4 text-lg"><dt className="font-bold">Total</dt><dd className="font-bold">{money(subtotal)}</dd></div>
          </dl>
          <div className="mt-5 flex gap-3 rounded-control bg-secondary-soft p-4 text-sm text-foreground">
            <Check className="size-5 shrink-0 text-secondary" aria-hidden="true" />
            <p><strong>No online payment.</strong><br /><span className="text-muted">Arrange payment safely with the seller.</span></p>
          </div>
          <button disabled={busy || !hasFulfilment || pickupUnavailable} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
            <LockKeyhole className="size-4" aria-hidden="true" />
            {busy ? "Placing order..." : "Place order"}
          </button>
          {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
          <Link href={productHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft className="size-4" aria-hidden="true" />Back to product</Link>
          <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-muted"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />The seller will confirm collection or delivery details after your order is placed.</p>
        </aside>
      </form>
    </Container>
  );
}

export default function CartPage() {
  return <Suspense fallback={<CheckoutSkeleton />}><CartContent /></Suspense>;
}
