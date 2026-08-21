"use client";

import { useCallback, useEffect, useState } from "react";

import { SectionHeading } from "@/app/components/seller/section-heading";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

type Order = { id: string; status: string; total_amount: number | string; created_at: string; buyer: { display_name: string }; items: { id: string; product_name: string; quantity: number }[] };
const nextStatus: Record<string, string> = { new: "preparing", preparing: "ready", ready: "completed" };

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => apiRequest<Order[]>("/seller/orders", { auth: true }).then(setOrders).catch((requestError) => setError(apiErrorMessage(requestError))), []);
  useEffect(() => { load(); }, [load]);
  async function transition(order: Order, status: string) { try { await apiRequest(`/seller/orders/${order.id}/status`, { method: "PATCH", auth: true, body: JSON.stringify({ status }) }); load(); } catch (requestError) { setError(apiErrorMessage(requestError)); } }
  return <div className="space-y-6"><SectionHeading eyebrow="Sales" title="Orders" description="Track preparation, collection, and delivery progress."/><div className="space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-bold">Order {order.id.slice(0, 8)}</h2><p className="text-xs text-slate-500">{order.buyer.display_name} · {new Date(order.created_at).toLocaleString()}</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-800">{order.status.replaceAll("_", " ")}</span></div><ul className="mt-4 text-sm text-slate-700">{order.items.map((item) => <li key={item.id}>{item.quantity} × {item.product_name}</li>)}</ul><div className="mt-4 flex items-center justify-between"><strong>R{Number(order.total_amount).toFixed(2)}</strong><div className="flex gap-2">{nextStatus[order.status] && <button onClick={() => transition(order, nextStatus[order.status])} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white">Mark {nextStatus[order.status].replaceAll("_", " ")}</button>}{!["completed", "cancelled"].includes(order.status) && <button onClick={() => transition(order, "cancelled")} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>}</div></div></article>)}{!orders.length && !error && <p className="text-slate-500">No seller orders yet.</p>}{error && <p role="alert" className="text-red-700">{error}</p>}</div></div>;
}
