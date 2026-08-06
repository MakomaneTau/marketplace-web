"use client";

import { Camera, MapPin, ShieldCheck, Store } from "lucide-react";
import { SectionHeading } from "@/app/components/seller/section-heading";

export default function SellerShopPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Storefront"
        title="My shop"
        description="Build buyer trust with a clear shop identity and collection information."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-violet-50 p-2 text-violet-700"><Store className="h-5 w-5" /></span>
              <div>
                <h2 className="font-bold text-slate-950">Shop identity</h2>
                <p className="text-xs text-slate-500">This information appears on your public seller profile.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row">
              <button type="button" className="relative grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-white">
                NS
                <span className="absolute -bottom-2 -right-2 rounded-full border-4 border-white bg-violet-700 p-1.5"><Camera className="h-3.5 w-3.5" /></span>
              </button>
              <div className="grid flex-1 gap-5">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Shop name</span>
                  <input defaultValue="Neo’s Student Store" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Shop tagline</span>
                  <input defaultValue="Affordable essentials for campus life" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
                </label>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">About your shop</span>
              <textarea rows={5} defaultValue="I sell useful, fairly priced student items around Wits. I respond quickly and prefer safe campus collection points." className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
            </label>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-violet-50 p-2 text-violet-700"><MapPin className="h-5 w-5" /></span>
              <div>
                <h2 className="font-bold text-slate-950">Location and collection</h2>
                <p className="text-xs text-slate-500">Only share general public pickup areas—not a home address.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">Primary campus</span>
                <select defaultValue="Wits University" className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
                  <option>Wits University</option>
                  <option>University of Johannesburg</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">Preferred pickup area</span>
                <input defaultValue="Braamfontein East Campus" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              </label>
            </div>
          </section>

          <button type="submit" className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800">Save shop changes</button>
        </form>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Buyer preview</p>
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-28 bg-linear-to-br from-violet-700 via-violet-600 to-indigo-500" />
            <div className="px-5 pb-6">
              <div className="-mt-10 grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-slate-950 text-xl font-black text-white">NS</div>
              <div className="mt-4 flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-950">Neo’s Student Store</h2>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-1 text-sm font-medium text-violet-700">Affordable essentials for campus life</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">I sell useful, fairly priced student items around Wits. I respond quickly and prefer safe campus collection points.</p>
              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-3 text-center">
                <div><p className="font-bold text-slate-950">4.9</p><p className="text-[10px] text-slate-500">Rating</p></div>
                <div><p className="font-bold text-slate-950">24</p><p className="text-[10px] text-slate-500">Sales</p></div>
                <div><p className="font-bold text-slate-950">12</p><p className="text-[10px] text-slate-500">Listings</p></div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500"><MapPin className="h-4 w-4" /> Braamfontein East Campus</p>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}
