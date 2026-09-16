"use client";

import {
  Building2,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { Container } from "@/app/components/layout/Container";
import { ReviewForm } from "@/app/components/orders/ReviewForm";
import { apiErrorMessage, apiRequest, SESSION_ERROR_MESSAGE } from "@/app/libs/api";

type OrderStatus = "new" | "preparing" | "ready" | "completed" | "cancelled";
type OrderFilter = "all" | "active" | "completed" | "cancelled";
type Order = {
  id: string;
  status: OrderStatus;
  total_amount: number | string;
  created_at: string;
  fulfilment_type?: "delivery" | "campus_pickup";
  delivery_address?: string | null;
  pickup_campus?: { name: string } | null;
  shop: { name: string };
  items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price?: number | string;
    line_total?: number | string;
  }[];
};

const filters: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<OrderStatus, string> = {
  new: "border-blue-200 bg-primary-soft text-primary",
  preparing: "border-amber-200 bg-amber-50 text-amber-700",
  ready: "border-emerald-200 bg-secondary-soft text-emerald-700",
  completed: "border-border bg-surface-muted text-foreground",
  cancelled: "border-red-200 bg-red-50 text-danger",
};

function money(value: number | string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function OrdersSkeleton() {
  return (
    <div className="mt-6 grid gap-4">
      {[0, 1].map((item) => (
        <div key={item} className="h-52 animate-pulse rounded-card border border-border bg-surface" />
      ))}
    </div>
  );
}

function OrdersContent() {
  const placed = useSearchParams().get("placed") === "1";
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chattingOrderId, setChattingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await apiRequest<Order[]>("/orders", { auth: true }));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void apiRequest<Order[]>("/orders", { auth: true })
      .then(setOrders)
      .catch((requestError) => setError(apiErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active") return !["completed", "cancelled"].includes(order.status);
    return order.status === filter;
  }), [filter, orders]);

  async function openDeliveryChat(order: Order) {
    if (["completed", "cancelled"].includes(order.status)) return;
    try {
      setChattingOrderId(order.id);
      setError(null);
      const conversation = await apiRequest<{ id: string }>(`/conversations/orders/${order.id}`, {
        method: "POST",
        auth: true,
      });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setChattingOrderId(null);
    }
  }

  if (error === SESSION_ERROR_MESSAGE) {
    return <ProtectedRequestError message={error} />;
  }

  return (
    <>
      {placed && (
        <section role="status" className="mt-6 flex gap-3 rounded-card border border-emerald-200 bg-secondary-soft p-4">
          <CheckCircle2 className="size-5 shrink-0 text-secondary" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">Order placed</h2>
            <p className="mt-1 text-sm text-muted">The seller can now confirm collection or delivery details with you.</p>
          </div>
        </section>
      )}

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Filter orders">
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`min-w-fit border-b-2 px-4 py-3 text-sm font-semibold transition ${filter === option.value ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? <OrdersSkeleton /> : error ? (
        <section className="mt-6 border-y border-border bg-surface px-5 py-12 text-center" role="alert">
          <h2 className="font-semibold">Orders could not be loaded</h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button type="button" onClick={() => void loadOrders()} className="mt-5 inline-flex items-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            <RotateCcw className="size-4" aria-hidden="true" />Try again
          </button>
        </section>
      ) : visibleOrders.length ? (
        <div className="mt-6 grid gap-4">
          {visibleOrders.map((order) => (
            <article key={order.id} className="rounded-card border border-border bg-surface p-5 sm:p-6">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted">Order {order.id.slice(0, 8)}</p>
                  <h2 className="mt-1 text-lg font-bold">{order.shop.name}</h2>
                  <p className="mt-1 text-xs text-muted">{formatDate(order.created_at)}</p>
                </div>
                <span className={`rounded-control border px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[order.status]}`}>
                  {order.status.replaceAll("_", " ")}
                </span>
              </header>

              <ul className="divide-y divide-border" aria-label="Order items">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.product_name}</p>
                      <p className="mt-1 text-xs text-muted">Quantity {item.quantity}{item.unit_price !== undefined ? ` x ${money(item.unit_price)}` : ""}</p>
                    </div>
                    {item.line_total !== undefined && <strong className="shrink-0">{money(item.line_total)}</strong>}
                  </li>
                ))}
              </ul>

              <footer className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
                <div className="flex items-start gap-2 text-sm text-muted">
                  {order.fulfilment_type === "delivery" ? <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
                  <span>{order.fulfilment_type === "delivery" ? "Delivery" : "Campus pickup"}{order.pickup_campus?.name ? ` at ${order.pickup_campus.name}` : ""}</span>
                </div>
                <div className="flex flex-wrap items-end justify-end gap-3 text-right">
                  {!["completed", "cancelled"].includes(order.status) && (
                    <button
                      type="button"
                      onClick={() => void openDeliveryChat(order)}
                      disabled={chattingOrderId === order.id}
                      className="inline-flex h-10 items-center gap-2 rounded-control border border-border-strong bg-white px-4 text-sm font-semibold text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MessageCircle className="size-4" aria-hidden="true" />
                      {chattingOrderId === order.id ? "Opening..." : "Chat about delivery"}
                    </button>
                  )}
                  <div><span className="text-xs text-muted">Order total</span><p className="text-lg font-bold">{money(order.total_amount)}</p></div>
                </div>
              </footer>

              {order.status === "completed" && order.items[0] && <ReviewForm orderId={order.id} productId={order.items[0].product_id} />}
            </article>
          ))}
        </div>
      ) : (
        <section className="mt-6 border-y border-border bg-surface px-5 py-12 text-center">
          <ClipboardList className="mx-auto size-8 text-muted" aria-hidden="true" />
          <h2 className="mt-4 font-semibold">{orders.length ? `No ${filter} orders` : "No orders yet"}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{orders.length ? "Choose another status to see your other orders." : "When you place an order, its progress will appear here."}</p>
          {!orders.length && <Link href="/search" className="mt-5 inline-flex rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">Browse listings</Link>}
        </section>
      )}
    </>
  );
}

export default function OrdersPage() {
  return (
    <Container className="py-8 sm:py-12">
      <header className="flex items-start gap-3">
        <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-control bg-primary-soft text-primary"><PackageCheck className="size-5" aria-hidden="true" /></span>
        <div><h1 className="text-3xl font-bold">My orders</h1><p className="mt-1 text-sm text-muted">Track purchases and arrange fulfilment with sellers.</p></div>
      </header>
      <Suspense fallback={<OrdersSkeleton />}><OrdersContent /></Suspense>
    </Container>
  );
}
