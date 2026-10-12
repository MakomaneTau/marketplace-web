"use client";

import { ArrowRight, Store } from "lucide-react";
import Link from "next/link";

type ShopSetupRequiredProps = {
  title?: string;
  description?: string;
};

export function ShopSetupRequired({
  title = "Create your shop profile",
  description = "Your seller account is ready. Add a shop name and pickup details before using seller tools.",
}: ShopSetupRequiredProps) {
  return (
    <section className="mx-auto flex min-h-[28rem] max-w-2xl flex-col items-center justify-center text-center">
      <span className="grid h-14 w-14 place-items-center rounded-lg bg-primary-soft text-primary">
        <Store className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      <Link
        href="/seller/shop"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
      >
        Set up shop
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
