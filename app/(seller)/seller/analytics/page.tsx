"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleDollarSign, Eye, ShoppingCart, TrendingUp } from "lucide-react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { StatCard } from "@/app/components/seller/stat-card";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

type Analytics = { period_days: number; revenue: number; completed_orders: number; average_order_value: number; total_views: number; daily_revenue: { date: string; revenue: number }[]; top_products: { product_id: string; name: string; units: number; revenue: number }[] };

export default function SellerAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => apiRequest<Analytics>(`/seller/analytics?days=${days}`, { auth: true }).then(setData).catch((requestError) => setError(apiErrorMessage(requestError))), [days]);
  useEffect(() => { load(); }, [load]);
  const max = Math.max(1, ...(data?.daily_revenue.map((item) => item.revenue) || [1]));
  return <div className="space-y-6"><SectionHeading eyebrow="Performance" title="Analytics" description="Understand how your shop is growing." action={<select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border bg-white px-4 py-2"><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>1 year</option></select>}/>{data && <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Revenue" value={`R${data.revenue.toFixed(2)}`} icon={CircleDollarSign}/><StatCard label="Completed orders" value={String(data.completed_orders)} icon={ShoppingCart}/><StatCard label="Average order" value={`R${data.average_order_value.toFixed(2)}`} icon={TrendingUp}/><StatCard label="Product views" value={String(data.total_views)} icon={Eye}/></section><section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Daily revenue</h2><div className="mt-5 flex h-48 items-end gap-2">{data.daily_revenue.map((item) => <div key={item.date} className="flex flex-1 flex-col items-center gap-2"><div title={`R${item.revenue}`} className="w-full rounded-t bg-violet-600" style={{ height: `${Math.max(4, item.revenue / max * 100)}%` }}/><span className="text-[10px] text-slate-500">{item.date.slice(5)}</span></div>)}</div></div><div className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Top products</h2><div className="mt-4 divide-y">{data.top_products.map((product) => <div key={product.product_id || product.name} className="flex justify-between py-3"><div><p className="font-semibold">{product.name}</p><p className="text-xs text-slate-500">{product.units} sold</p></div><strong>R{product.revenue.toFixed(2)}</strong></div>)}</div></div></section></>}{!data && !error && <p className="text-slate-500">Loading analytics...</p>}{error && <ProtectedRequestError message={error}/>}</div>;
}
