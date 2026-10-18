"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import { apiRequest, apiErrorMessage } from "@/lib/api";
import type { SearchFilters } from "@/components/search/search-model";

export function SavedSearchControl({ filters }: { filters: SearchFilters }) {
  const { auth } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const name = String(new FormData(event.currentTarget).get("name") || "");
    setBusy(true);
    try {
      await apiRequest("/saved-searches", {
        auth: true,
        method: "POST",
        body: JSON.stringify({ name, filters }),
      });
      setMessage(
        "Search saved. Matching new listings will appear in your alerts.",
      );
    } catch (failure) {
      setMessage(apiErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  if (!auth)
    return (
      <p className="my-4 text-sm text-muted">
        <Link
          href="/login?next=/alerts"
          className="font-semibold text-primary-text underline"
        >
          Sign in
        </Link>{" "}
        to save searches and get new-listing alerts.
      </p>
    );
  return (
    <details className="my-5 border-b border-border pb-4">
      <summary className="cursor-pointer text-sm font-semibold text-primary-text">
        Save this search and get alerts
      </summary>
      <form onSubmit={save} className="mt-3 flex flex-wrap gap-3">
        <input
          name="name"
          required
          maxLength={80}
          aria-label="Saved search name"
          placeholder="e.g. Textbooks under R300"
          className="min-w-0 rounded-control border border-border px-3 py-2 text-sm"
        />
        <button
          disabled={busy}
          className="rounded-control bg-primary-action px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save search"}
        </button>
        <Link
          href="/alerts"
          className="self-center text-sm text-primary-text underline"
        >
          Manage alerts
        </Link>
      </form>
      {message && (
        <p role="status" className="mt-2 text-sm">
          {message}
        </p>
      )}
    </details>
  );
}
