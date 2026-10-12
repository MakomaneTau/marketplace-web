"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";

import { apiErrorMessage, apiRequest } from "@/lib/api";

import type { AdminUser, PageResult } from "./types";

export function AdminUsers({ onChanged }: { onChanged: () => void }) {
  const [role, setRole] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<AdminUser, "users"> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const query = new URLSearchParams({ page: String(page), limit: "20" });
    if (role) query.set("role", role);
    if (search) query.set("search", search);
    try {
      setResult(
        await apiRequest<PageResult<AdminUser, "users">>(
          `/admin/users?${query}`,
          { auth: true },
        ),
      );
      setError(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  }, [page, role, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function applyRestriction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await apiRequest(`/admin/users/${selected.id}/restriction`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          suspended: !selected.restriction,
          reason: reason.trim(),
        }),
      });
      setSelected(null);
      setReason("");
      await load();
      onChanged();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="admin-users-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="admin-users-title" className="text-xl font-bold">
            Users
          </h2>
          <p className="mt-1 text-sm text-muted">
            Search buyers and sellers by display name. Every access change
            requires a reason and is recorded.
          </p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          role="search"
          className="flex flex-wrap gap-2"
        >
          <label htmlFor="admin-role" className="sr-only">
            Account type
          </label>
          <select
            id="admin-role"
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm"
          >
            <option value="">All roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
          </select>
          <label htmlFor="admin-search" className="sr-only">
            Search users
          </label>
          <input
            id="admin-search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Display name"
            maxLength={100}
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm"
          />
          <button
            type="submit"
            className="h-11 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}{" "}
          <button
            type="button"
            onClick={() => void load()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </p>
      )}
      <div className="mt-5 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result?.users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <span className="block font-semibold">
                    {user.displayName}
                  </span>
                  <span className="block font-mono text-xs text-muted">
                    {user.id}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize">
                  {user.role}
                  {user.isAdmin && (
                    <span className="ml-2 rounded-full bg-surface-muted px-2 py-1 text-xs font-semibold normal-case">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      user.restriction
                        ? "font-semibold text-danger"
                        : "font-semibold text-success"
                    }
                  >
                    {user.restriction ? "Suspended" : "Active"}
                  </span>
                  {user.restriction && (
                    <span className="block max-w-xs text-xs text-muted">
                      {user.restriction.reason}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(user.createdAt).toLocaleDateString("en-ZA")}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.isAdmin ? (
                    <span className="text-xs text-muted">Protected</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(user);
                        setReason("");
                      }}
                      className="min-h-10 rounded-control border border-border px-3 font-semibold hover:bg-surface-muted"
                    >
                      {user.restriction ? "Restore" : "Suspend"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {result?.users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No users match these filters.
                </td>
              </tr>
            )}
            {!result && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Loading users...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
          <span>{result.total} users</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-control border border-border px-3 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 py-2">Page {page}</span>
            <button
              type="button"
              disabled={page * 20 >= result.total}
              onClick={() => setPage(page + 1)}
              className="rounded-control border border-border px-3 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4"
          role="presentation"
        >
          <form
            onSubmit={applyRestriction}
            role="dialog"
            aria-modal="true"
            aria-labelledby="restriction-title"
            className="w-full max-w-md rounded-card bg-surface p-6 shadow-xl"
          >
            <h3 id="restriction-title" className="text-lg font-bold">
              {selected.restriction ? "Restore" : "Suspend"}{" "}
              {selected.displayName}?
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {selected.restriction
                ? "This account will regain access to Marketplace."
                : "This account will lose access to authenticated Marketplace actions immediately."}
            </p>
            <label
              htmlFor="restriction-reason"
              className="mt-5 block text-sm font-semibold"
            >
              Reason for the audit log
            </label>
            <textarea
              id="restriction-reason"
              required
              minLength={10}
              maxLength={500}
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm"
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={busy}
                className="rounded-control px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {busy ? "Saving..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
