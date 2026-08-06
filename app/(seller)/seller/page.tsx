import {
  ArrowRight,
  CircleDollarSign,
  Eye,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { StatCard } from "@/app/components/seller/stat-card";
import { StatusBadge } from "@/app/components/seller/status-badge";
import { sellerOrders, sellerProducts } from "@/app/data/seller";

export default function SellerDashboardPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Seller overview"
        title="Good evening, John!"
        description="Here is what is happening with your shop today."
        action={
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> Add a product
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value="R1,320" change="+18%" helper="from last month" icon={CircleDollarSign} />
        <StatCard label="Active listings" value="12" helper="3 items low in stock" icon={Package} />
        <StatCard label="Open orders" value="4" helper="2 need your attention" icon={ShoppingBag} />
        <StatCard label="Product views" value="467" change="+9%" helper="over the last 7 days" icon={Eye} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950">Recent orders</h2>
              <p className="mt-1 text-xs text-slate-500">Process new orders promptly to keep buyers informed.</p>
            </div>
            <Link href="/seller/orders" className="text-sm font-semibold text-violet-700 hover:text-violet-900">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {sellerOrders.map((order) => (
              <article key={order.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{order.item}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.id} · {order.buyer} · {order.placedAt}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <p className="font-bold text-slate-950">R{order.total}</p>
                  <Link href="/seller/orders" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Shop actions</h2>
              <span className="text-xs font-semibold text-slate-400">Quick access</span>
            </div>
            <div className="mt-4 grid gap-3">
              <Link href="/seller/products/new" className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-900 hover:bg-violet-100">
                Create a new listing <Plus className="h-4 w-4" />
              </Link>
              <Link href="/seller/messages" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                Reply to buyers <MessageSquare className="h-4 w-4" />
              </Link>
              <Link href="/seller/shop" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100">
                Update shop profile <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Listing performance</h2>
              <Link href="/seller/products" className="text-xs font-semibold text-violet-700">Manage</Link>
            </div>
            <div className="mt-4 space-y-4">
              {sellerProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl">{product.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.views} views</p>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
