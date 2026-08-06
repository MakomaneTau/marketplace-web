import { MoreHorizontal, Pencil, Plus, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { StatusBadge } from "@/app/components/seller/status-badge";
import { sellerProducts } from "@/app/data/seller";

export default function SellerProductsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Inventory"
        title="Products"
        description="Create, edit, pause, and track all your marketplace listings."
        action={
          <Link href="/seller/products/new" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search products"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </label>
        <select className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-500">
          <option>All statuses</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Sold</option>
          <option>Paused</option>
        </select>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Product</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 font-semibold">Stock</th>
              <th className="px-5 py-4 font-semibold">Views</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sellerProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-2xl">{product.emoji}</span>
                    <div>
                      <p className="font-semibold text-slate-950">{product.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{product.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-900">R{product.price}</td>
                <td className="px-5 py-4 text-slate-600">{product.stock}</td>
                <td className="px-5 py-4 text-slate-600">{product.views}</td>
                <td className="px-5 py-4"><StatusBadge status={product.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/seller/products/${product.id}/edit`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label={`Edit ${product.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label={`More actions for ${product.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {sellerProducts.map((product) => (
          <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-slate-100 text-3xl">{product.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-950">{product.name}</h2>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-950">R{product.price}</span>
                  <span className="text-slate-500">Stock {product.stock} · {product.views} views</span>
                </div>
              </div>
            </div>
            <Link href={`/seller/products/${product.id}/edit`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Pencil className="h-4 w-4" /> Edit listing
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
