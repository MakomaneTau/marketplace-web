import { CircleDollarSign, Eye, Package, ShoppingCart, TrendingUp } from "lucide-react";

import { SectionHeading } from "@/app/components/seller/section-heading";
import { StatCard } from "@/app/components/seller/stat-card";
import { sellerProducts, weeklyRevenue } from "@/app/data/seller";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const maxRevenue = Math.max(...weeklyRevenue);

export default function SellerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Performance"
        title="Analytics"
        description="Understand which listings attract buyers and how your shop is growing."
        action={
          <select className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value="R5,050" change="+12.4%" helper="from previous period" icon={CircleDollarSign} />
        <StatCard label="Orders" value="18" change="+5.8%" helper="from previous period" icon={ShoppingCart} />
        <StatCard label="Listing views" value="1,284" change="+9.2%" helper="from previous period" icon={Eye} />
        <StatCard label="Conversion rate" value="3.7%" helper="views that became orders" icon={TrendingUp} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Revenue trend</h2>
              <p className="mt-1 text-xs text-slate-500">Daily sales revenue in rand.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">+R640 this week</span>
          </div>

          <div className="mt-8 flex h-72 items-end gap-3 sm:gap-5">
            {weeklyRevenue.map((value, index) => (
              <div key={days[index]} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-500">R{value}</span>
                <div className="flex h-56 w-full items-end rounded-t-lg bg-slate-100">
                  <div
                    className="w-full rounded-t-lg bg-violet-600 transition hover:bg-violet-700"
                    style={{ height: `${Math.max(10, (value / maxRevenue) * 100)}%` }}
                    title={`${days[index]}: R${value}`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{days[index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-violet-700" />
            <h2 className="font-bold text-slate-950">Top products</h2>
          </div>
          <div className="mt-5 space-y-5">
            {[...sellerProducts].sort((a, b) => b.views - a.views).map((product, index) => (
              <div key={product.id}>
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-slate-400">{index + 1}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl">{product.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.views} views</p>
                  </div>
                  <span className="text-sm font-bold text-slate-950">R{product.price}</span>
                </div>
                <div className="ml-20 mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(12, (product.views / 203) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
