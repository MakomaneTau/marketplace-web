"use client";

import { useEffect, useState } from "react";

import { Container } from "@/app/components/layout/Container";
import { ReviewForm } from "@/app/components/orders/ReviewForm";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

type Order = { id: string; status: string; total_amount: number | string; created_at: string; shop: { name: string }; items: { id: string; product_id: string; product_name: string; quantity: number }[] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { apiRequest<Order[]>("/orders", { auth: true }).then(setOrders).catch((requestError) => setError(apiErrorMessage(requestError))); }, []);
  return <Container className="py-8"><h1 className="text-2xl font-bold">My orders</h1><div className="mt-6 space-y-4">{orders.map((order) => <article key={order.id} className="rounded-card border border-border bg-surface p-5"><div className="flex justify-between gap-4"><div><p className="font-semibold">{order.shop.name}</p><p className="text-xs text-muted">{new Date(order.created_at).toLocaleString()}</p></div><span className="capitalize text-primary">{order.status.replaceAll("_", " ")}</span></div><ul className="mt-4 text-sm text-muted">{order.items.map((item) => <li key={item.id}>{item.quantity} × {item.product_name}</li>)}</ul><p className="mt-3 font-bold">R{Number(order.total_amount).toFixed(2)}</p>{order.status === "completed" && order.items[0] && <ReviewForm orderId={order.id} productId={order.items[0].product_id}/>}</article>)}{!orders.length && !error && <p className="text-muted">You have no orders yet.</p>}{error && <p role="alert" className="text-danger">{error}</p>}</div></Container>;
}
