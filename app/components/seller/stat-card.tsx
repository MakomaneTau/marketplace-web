import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type StatCardProps = {
  href?: string;
  label: string;
  value: string;
  change?: string;
  helper?: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, change, helper, icon: Icon, href }: StatCardProps) {
  const content = (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {(change || helper) && (
        <p className="mt-4 text-xs text-slate-500">
          {change && <span className="font-semibold text-emerald-700">{change}</span>}{" "}
          {helper}
        </p>
      )}
    </article>
  );
  return href ? <Link href={href} aria-label={`View ${label.toLowerCase()}`} className="block rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-violet-600">{content}</Link> : content;
}
