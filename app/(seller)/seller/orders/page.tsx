import { Check, ChevronRight, Clock3, PackageCheck, Search } from "lucide-react";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { StatusBadge } from "@/app/components/seller/status-badge";
import { sellerOrders } from "@/app/data/seller";

const tabs = ["All", "New", "Preparing", "Ready", "Completed", "Cancelled"];

export default function SellerOrdersPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Sales"
        title="Orders"
        description="Track payment, preparation, collection, and delivery progress."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Clock3 className="h-5 w-5 text-violet-700" />
          <p className="mt-4 text-2xl font-bold text-slate-950">2</p>
          <p className="text-sm text-slate-500">Need attention</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <PackageCheck className="h-5 w-5 text-violet-700" />
          <p className="mt-4 text-2xl font-bold text-slate-950">4</p>
          <p className="text-sm text-slate-500">Open orders</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Check className="h-5 w-5 text-violet-700" />
          <p className="mt-4 text-2xl font-bold text-slate-950">18</p>
          <p className="text-sm text-slate-500">Completed this month</p>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-3">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={index === 0 ? "whitespace-nowrap rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white" : "whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"}
            >
              {tab}
            </button>
          ))}
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by order, buyer, or product" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
        </label>
      </div>

      <div className="space-y-4">
        {sellerOrders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-slate-950">Order {order.id}</h2>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">Placed {order.placedAt}</p>
              </div>
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                View details <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-slate-400">Buyer</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{order.buyer}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Product</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{order.item}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Fulfilment</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{order.fulfilment}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total</p>
                <p className="mt-1 text-sm font-bold text-slate-950">R{order.total}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
