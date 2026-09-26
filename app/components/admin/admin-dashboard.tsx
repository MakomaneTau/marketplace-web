"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck, Users } from "lucide-react";

import { useAuth } from "@/app/hooks/use-auth";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

import { AdminUsers } from "./admin-users";
import { AdminReports } from "./admin-reports";
import { AdminVerifications } from "./admin-verifications";
import type { AdminOverview, AdminTab } from "./types";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "users", label: "Users" },
  { id: "reports", label: "Safety reports" },
  { id: "verifications", label: "Seller verification" },
];

export function AdminDashboard() {
  const { auth, ready } = useAuth();
  const [tab, setTab] = useState<AdminTab>("users");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshOverview = useCallback(async () => {
    try {
      setOverview(await apiRequest<AdminOverview>("/admin/overview", { auth: true }));
      setError(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  }, []);

  useEffect(() => {
    if (!ready || !auth?.profile?.isAdmin) return;
    const timeout = window.setTimeout(() => void refreshOverview(), 0);
    return () => window.clearTimeout(timeout);
  }, [ready, auth, refreshOverview]);

  if (!ready) return <p role="status" className="p-8 text-center text-muted">Checking admin access...</p>;
  if (!auth?.profile?.isAdmin) return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <ShieldCheck className="mx-auto size-10 text-muted" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
      <p className="mt-2 text-muted">This account has not been granted Marketplace admin access.</p>
      <Link href="/" className="mt-5 inline-block font-semibold text-primary underline">Return to Marketplace</Link>
    </section>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><ShieldCheck className="size-4" aria-hidden="true" />Marketplace operations</p>
            <h1 className="mt-2 text-3xl font-bold">Admin centre</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">Review account access, safety reports and seller verification requests.</p>
          </div>
          <Link href="/" className="rounded-control border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted">Marketplace home</Link>
        </header>

        {error && <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-control border border-danger/30 bg-red-50 p-4 text-sm text-danger"><span>{error}</span><button type="button" onClick={() => void refreshOverview()} className="font-semibold underline">Retry</button></div>}

        <section aria-label="Marketplace overview" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {([
            { label: "Buyers", value: overview?.buyers, icon: Users },
            { label: "Sellers", value: overview?.sellers, icon: Users },
            { label: "Suspended", value: overview?.suspended, icon: AlertTriangle },
            { label: "Open reports", value: overview?.openReports, icon: AlertTriangle },
            { label: "Pending checks", value: overview?.pendingVerifications, icon: CheckCircle2 },
          ]).map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-card border border-border bg-surface p-4">
              <div className="flex items-center justify-between text-sm text-muted"><span>{label}</span><Icon className="size-4" aria-hidden="true" /></div>
              <p className="mt-2 text-2xl font-bold tabular-nums">{value ?? "—"}</p>
            </div>
          ))}
        </section>

        <nav aria-label="Admin sections" className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-current={tab === item.id ? "page" : undefined} className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold ${tab === item.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>{item.label}</button>)}
        </nav>

        <div className="py-6">
          {tab === "users" && <AdminUsers onChanged={refreshOverview} />}
          {tab === "reports" && <AdminReports onChanged={refreshOverview} />}
          {tab === "verifications" && <AdminVerifications onChanged={refreshOverview} />}
        </div>
      </div>
    </div>
  );
}
