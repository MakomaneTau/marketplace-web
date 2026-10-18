"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, apiErrorMessage, SESSION_ERROR_MESSAGE } from "@/lib/api";
import { ProtectedRequestError } from "@/components/auth/protected-request-error";
import { Container } from "@/components/layout/Container";
import { formatZAR } from "@/lib/format";

import { readBasket, writeBasket, type BasketItem } from "./basket-store";
import {
  fetchCheckoutData,
  type CheckoutProduct,
  type Campus,
} from "./checkout-model";

type Loaded = {
  item: BasketItem;
  product: CheckoutProduct | null;
  campuses: Campus[];
  error: string | null;
};
export function BasketPage() {
  const { auth, ready } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Loaded[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    const entries = readBasket(auth.user.id);
    const loaded = await Promise.all(
      entries.map(async (item) => {
        try {
          const data = await fetchCheckoutData(item.productId);
          return {
            item,
            product: data.item,
            campuses: data.campuses,
            error: data.campusError,
          };
        } catch (failure) {
          return {
            item,
            product: null,
            campuses: [],
            error: apiErrorMessage(failure),
          };
        }
      }),
    );
    setRows(loaded);
    setLoading(false);
  }, [auth]);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initial);
  }, [load]);
  function change(id: string, quantity: number) {
    if (!auth) return;
    try {
      writeBasket(
        auth.user.id,
        readBasket(auth.user.id).flatMap((item) =>
          item.productId === id
            ? quantity
              ? [{ ...item, quantity }]
              : []
            : [item],
        ),
      );
      void load();
    } catch {
      setError(
        "Your browser could not save the basket. Check storage permissions.",
      );
    }
  }
  const groups = rows
    .filter((row) => row.product)
    .reduce<Record<string, Loaded[]>>((all, row) => {
      (all[row.product!.shop.id] ??= []).push(row);
      return all;
    }, {});
  if (!ready) return <LoadingSplash label="Preparing your basket…" />;
  if (!auth) return <ProtectedRequestError message={SESSION_ERROR_MESSAGE} />;
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-black">Your basket</h1>
      <p className="mt-2 text-muted">
        Items stay in this browser for your account. Place a separate order with
        each shop.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-danger">
          {error}
        </p>
      )}
      {loading ? (
        <LoadingSplash
          compact
          label="Checking current prices and availability…"
        />
      ) : (
        <>
          {!rows.length && (
            <div className="py-12">
              <p>Your basket is empty.</p>
              <Link
                href="/search"
                className="mt-4 inline-block font-semibold text-primary-text"
              >
                Browse listings
              </Link>
            </div>
          )}
          {rows
            .filter((row) => !row.product)
            .map((row) => (
              <div
                key={row.item.productId}
                role="alert"
                className="my-5 border-b border-border py-4"
              >
                <p>{row.error || "Item unavailable"}</p>
                <button
                  onClick={() => change(row.item.productId, 0)}
                  className="mt-2 text-primary-text underline"
                >
                  Remove unavailable item
                </button>
              </div>
            ))}
          {Object.entries(groups).map(([id, group]) => (
            <ShopBasket
              key={id}
              rows={group!}
              change={change}
              placed={() => {
                if (auth) {
                  const ids = new Set(group!.map((row) => row.item.productId));
                  try {
                    writeBasket(
                      auth.user.id,
                      readBasket(auth.user.id).filter(
                        (item) => !ids.has(item.productId),
                      ),
                    );
                  } catch {
                    /* The order succeeded; continue to its confirmation. */
                  }
                  router.push("/orders?placed=1");
                }
              }}
            />
          ))}
        </>
      )}
    </Container>
  );
}
function ShopBasket({
  rows,
  change,
  placed,
}: {
  rows: Loaded[];
  change: (id: string, quantity: number) => void;
  placed: () => void;
}) {
  const [method, setMethod] = useState(
    rows.every((row) => row.product!.allows_campus_pickup)
      ? "campus_pickup"
      : "delivery",
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const pickup = rows.every((row) => row.product!.allows_campus_pickup),
    delivery = rows.every((row) => row.product!.allows_delivery);
  const invalid = rows.some(
    (row) => row.item.quantity > (row.product!.stock_quantity ?? 0),
  );
  const campuses = rows[0].campuses;
  const shop = rows[0].product!.shop;
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await apiRequest("/orders", {
        auth: true,
        method: "POST",
        body: JSON.stringify({
          items: rows.map((row) => row.item),
          fulfilmentType: method,
          ...(method === "delivery"
            ? { deliveryAddress: form.get("address") }
            : {
                pickupCampusId: form.get("campus"),
                pickupNotes: form.get("notes"),
              }),
        }),
      });
      placed();
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="text-xl font-bold">{shop.name}</h2>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div
            key={row.item.productId}
            className="flex flex-wrap items-center justify-between gap-3 py-5"
          >
            <div>
              <Link
                href={`/products/${row.product!.slug}`}
                className="font-semibold text-primary-text"
              >
                {row.product!.title}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {formatZAR(Number(row.product!.price))} each ·{" "}
                {row.product!.stock_quantity} available
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm">
                Quantity{" "}
                <input
                  type="number"
                  aria-label={`Quantity for ${row.product!.title}`}
                  min={1}
                  max={Math.min(99, row.product!.stock_quantity ?? 99)}
                  value={row.item.quantity}
                  onChange={(event) => {
                    const n = Number(event.target.value);
                    if (Number.isInteger(n) && n > 0 && n <= 99)
                      change(row.item.productId, n);
                  }}
                  className="ml-2 w-16 rounded border border-border px-2 py-1"
                />
              </label>
              <button
                onClick={() => change(row.item.productId, 0)}
                className="text-sm text-muted underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xl font-bold">
        Total{" "}
        {formatZAR(
          rows.reduce(
            (sum, row) => sum + Number(row.product!.price) * row.item.quantity,
            0,
          ),
        )}
      </p>
      <form onSubmit={checkout} className="mt-5 max-w-xl space-y-4">
        <label className="block text-sm font-semibold">
          How will you receive this order?
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            className="mt-2 w-full rounded-control border border-border px-3 py-2"
          >
            {pickup && <option value="campus_pickup">Campus pickup</option>}
            {delivery && <option value="delivery">Delivery</option>}
          </select>
        </label>
        {method === "campus_pickup" ? (
          <>
            <label className="block text-sm">
              Pickup campus
              <select
                name="campus"
                required
                className="mt-2 w-full rounded-control border border-border px-3 py-2"
              >
                <option value="">Choose a campus</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Pickup notes
              <input
                name="notes"
                maxLength={500}
                className="mt-2 w-full rounded-control border border-border px-3 py-2"
              />
            </label>
            {!campuses.length && (
              <p role="alert" className="text-sm text-danger">
                Pickup campuses are unavailable. Reload the basket or choose
                delivery.
              </p>
            )}
          </>
        ) : (
          <label className="block text-sm">
            Delivery address
            <textarea
              name="address"
              required
              maxLength={500}
              className="mt-2 w-full rounded-control border border-border px-3 py-2"
            />
          </label>
        )}
        {!pickup && !delivery && (
          <p role="alert" className="text-danger">
            These products have no shared collection option. Order them
            separately.
          </p>
        )}
        {invalid && (
          <p role="alert" className="text-danger">
            Reduce quantities to the available stock before ordering.
          </p>
        )}
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
        <p className="text-sm text-muted">
          No online payment. Arrange payment safely with the seller.
        </p>
        <button
          disabled={
            busy ||
            invalid ||
            (!pickup && !delivery) ||
            (method === "campus_pickup" && !campuses.length)
          }
          className="rounded-control bg-primary-action px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Placing order…" : "Place order with this shop"}
        </button>
      </form>
    </section>
  );
}
