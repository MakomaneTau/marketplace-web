import { cn } from "@/app/libs/utils";

type StatusBadgeProps = {
  status: string;
};

const styles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Draft: "bg-slate-100 text-slate-700 ring-slate-500/20",
  Sold: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Paused: "bg-amber-50 text-amber-700 ring-amber-600/20",
  New: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Preparing: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Ready: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        styles[status] ?? "bg-slate-100 text-slate-700 ring-slate-500/20",
      )}
    >
      {status}
    </span>
  );
}
