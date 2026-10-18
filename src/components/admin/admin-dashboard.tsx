"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { useAuth } from "@/hooks/use-auth";
import { apiErrorMessage, apiRequest, logout } from "@/lib/api";

import { AdminUsers } from "./admin-users";
import { AdminReports } from "./admin-reports";
import { AdminVerifications } from "./admin-verifications";
import type { AdminOverview, AdminTab } from "./types";
import { AdminMfa } from "./admin-mfa";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "users", label: "Users" },
  { id: "reports", label: "Safety reports" },
  { id: "verifications", label: "Seller verification" },
];

export function AdminDashboard() {
  const { auth, ready } = useAuth();
  if (!ready) return <LoadingSplash label="Checking admin access…" />;
  if (!auth?.profile?.isAdmin) return <AdminDashboardContent />;
  return (
    <AdminMfa>
      <AdminDashboardContent />
    </AdminMfa>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const { auth, ready } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("users");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshOverview = useCallback(async () => {
    try {
      setOverview(
        await apiRequest<AdminOverview>("/admin/overview", { auth: true }),
      );
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

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError(null);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch (requestError) {
      setLogoutError(apiErrorMessage(requestError));
      setSigningOut(false);
    }
  }

  if (signingOut) return <LoadingSplash label="Logging out…" />;
  if (!ready) return <LoadingSplash label="Checking admin access…" />;
  if (!auth?.profile?.isAdmin)
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <ShieldCheck
          className="mx-auto size-10 text-muted"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-muted">
          This account has not been granted Marketplace admin access.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block font-semibold text-primary-text underline"
        >
          Return to Marketplace
        </Link>
        {logoutError && (
          <p role="alert" className="mt-4 text-danger">
            {logoutError}
          </p>
        )}
        <Link
          href="/login"
          className="mt-4 block font-semibold text-primary-text underline"
        >
          Sign in
        </Link>
      </section>
    );

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-text">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Marketplace operations
            </p>
            <h1 className="mt-2 text-3xl font-bold">Admin centre</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Review account access, safety reports and seller verification
              requests.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={signingOut}
            className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text disabled:opacity-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>
        </header>

        {logoutError && (
          <p role="alert" className="mt-4 text-danger">
            {logoutError}
          </p>
        )}

        {!overview && !error && (
          <LoadingSplash compact label="Loading admin overview…" />
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-control border border-danger/30 bg-red-50 p-4 text-sm text-danger"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void refreshOverview()}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <section
          aria-label="Marketplace overview"
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          {[
            { label: "Buyers", value: overview?.buyers, icon: Users },
            { label: "Sellers", value: overview?.sellers, icon: Users },
            {
              label: "Suspended",
              value: overview?.suspended,
              icon: AlertTriangle,
            },
            {
              label: "Open reports",
              value: overview?.openReports,
              icon: AlertTriangle,
            },
            {
              label: "Pending checks",
              value: overview?.pendingVerifications,
              icon: CheckCircle2,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-card border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{label}</span>
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {value ?? "—"}
              </p>
            </div>
          ))}
        </section>

        <nav
          aria-label="Admin sections"
          className="mt-8 flex gap-1 overflow-x-auto border-b border-border"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? "page" : undefined}
              className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold ${tab === item.id ? "border-primary text-primary-text" : "border-transparent text-muted hover:text-foreground"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="py-6">
          {tab === "users" && <AdminUsers onChanged={refreshOverview} />}
          {tab === "reports" && <AdminReports onChanged={refreshOverview} />}
          {tab === "verifications" && (
            <AdminVerifications onChanged={refreshOverview} />
          )}
        </div>
      </div>
    </div>
  );
}
