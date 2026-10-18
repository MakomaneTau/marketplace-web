"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { apiRequest, apiErrorMessage } from "@/lib/api";
export type Offer = {
  id: string;
  product_id: string;
  unit_price: number;
  quantity: number;
  status: string;
  expires_at: string;
};
export function OfferPanel({
  conversationId,
  buyer,
}: {
  conversationId: string;
  buyer: boolean;
}) {
  const [offers, setOffers] = useState<Offer[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [loadedConversation, setLoadedConversation] = useState<string | null>(
    null,
  );
  const loading = loadedConversation !== conversationId;
  const load = useCallback(async () => {
    try {
      setOffers(
        await apiRequest<Offer[]>(`/conversation-offers/${conversationId}`, {
          auth: true,
        }),
      );
      setError("");
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoadedConversation(conversationId);
    }
  }, [conversationId]);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 15000);
    return () => {
      window.clearTimeout(initial);
      clearInterval(timer);
    };
  }, [load]);
  async function send(path: string, body: unknown, method: string) {
    setBusy(true);
    try {
      await apiRequest(path, {
        method,
        auth: true,
        body: JSON.stringify(body),
      });
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="border-b border-border p-4">
      <summary className="cursor-pointer font-semibold">
        Offers {offers.length ? `(${offers.length})` : ""}
      </summary>
      {(loading || busy) && (
        <LoadingSplash
          compact
          label={busy ? "Updating offer…" : "Loading offers…"}
        />
      )}
      <p className="my-2 text-sm text-muted">
        Offers expire after 48 hours. Stock is reserved when an order is placed.
      </p>
      {error && (
        <p role="alert">
          {error} <button onClick={() => void load()}>Retry</button>
        </p>
      )}
      {buyer && !loading && (
        <form
          className="my-3 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void send(
              `/conversation-offers/${conversationId}`,
              {
                price: Number(data.get("price")),
                quantity: Number(data.get("quantity")),
              },
              "POST",
            );
          }}
        >
          <label>
            Price per item (R)
            <input
              className="block w-32 rounded border p-2"
              name="price"
              type="number"
              required
              min="0.01"
              step="0.01"
            />
          </label>
          <label>
            Quantity
            <input
              className="block w-24 rounded border p-2"
              name="quantity"
              type="number"
              required
              min="1"
              max="99"
              defaultValue="1"
            />
          </label>
          <button
            disabled={busy || offers.some((o) => o.status === "pending")}
            className="p-2 underline"
          >
            Make offer
          </button>
        </form>
      )}
      {!loading &&
        offers.map((offer) => (
          <div key={offer.id} className="my-3 text-sm">
            <p>
              R{Number(offer.unit_price).toFixed(2)} × {offer.quantity} ·{" "}
              {offer.status}
            </p>
            <p className="text-muted">
              Expires {new Date(offer.expires_at).toLocaleString()}
            </p>
            {offer.status === "pending" &&
              (buyer ? ["withdrawn"] : ["accepted", "declined"]).map(
                (status) => (
                  <button
                    key={status}
                    disabled={busy}
                    className="mr-4 py-2 underline"
                    onClick={() =>
                      void send(`/offers/${offer.id}`, { status }, "PATCH")
                    }
                  >
                    {status === "withdrawn"
                      ? "Withdraw"
                      : status === "accepted"
                        ? "Accept"
                        : "Decline"}
                  </button>
                ),
              )}
            {buyer && offer.status === "accepted" && (
              <Link
                className="inline-block py-2 underline"
                href={`/cart?product=${offer.product_id}&offer=${offer.id}`}
              >
                Checkout at agreed price
              </Link>
            )}
          </div>
        ))}
    </details>
  );
}
