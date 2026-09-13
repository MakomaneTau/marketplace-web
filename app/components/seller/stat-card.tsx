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
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
        </div>
        <span className="rounded-lg bg-primary-soft p-2.5 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {(change || helper) && (
        <p className="mt-3 text-xs text-slate-500">
          {change && <span className="font-semibold text-emerald-700">{change}</span>}{" "}
          {helper}
        </p>
      )}
    </article>
  );
  return href ? <Link href={href} aria-label={`View ${label.toLowerCase()}`} className="block rounded-lg transition hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">{content}</Link> : content;
}
