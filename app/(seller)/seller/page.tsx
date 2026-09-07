"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, MessageSquare, Package, Plus, ShoppingBag } from "lucide-react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { useUnreadMessages } from "@/app/components/messaging/unread-messages";
import { StatCard } from "@/app/components/seller/stat-card";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

type Dashboard = { shop: { name: string }; products: { total: number; active: number; views: number }; orders: { total: number; open: number; recent: { id: string; status: string; total_amount: number | string; created_at: string }[] }; unread_notifications: number; unread_messages: number };

export default function SellerDashboardPage() {
  const unreadMessages = useUnreadMessages();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { apiRequest<Dashboard>("/seller/dashboard", { auth: true }).then(setData).catch((requestError) => setError(apiErrorMessage(requestError))); }, []);
  return <div className="space-y-8"><SectionHeading eyebrow="Seller overview" title={data ? data.shop.name : "Seller dashboard"} description="Here is what is happening with your shop today." action={<Link href="/seller/products/new" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4"/>Add a product</Link>}/>{data && <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard href="/seller/products" label="Active listings" value={String(data.products.active)} helper={`${data.products.total} total`} icon={Package}/><StatCard href="/seller/orders" label="Open orders" value={String(data.orders.open)} helper={`${data.orders.total} total`} icon={ShoppingBag}/><StatCard href="/seller/analytics" label="Product views" value={String(data.products.views)} icon={Eye}/><StatCard href="/seller/messages" label="Unread messages" value={String(unreadMessages ?? data.unread_messages)} helper={`${data.unread_notifications} notifications`} icon={MessageSquare}/></section><section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Recent orders</h2><div className="mt-4 divide-y">{data.orders.recent.map((order) => <div key={order.id} className="flex justify-between py-3"><div><p className="font-semibold">Order {order.id.slice(0, 8)}</p><p className="text-xs capitalize text-slate-500">{order.status.replaceAll("_", " ")}</p></div><p className="font-bold">R{Number(order.total_amount).toFixed(2)}</p></div>)}</div></section></>}{!data && !error && <p className="text-slate-500">Loading dashboard...</p>}{error && <ProtectedRequestError message={error}/>}</div>;
}
