"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { apiErrorMessage, apiRequest } from "@/lib/api";

import type { PageResult, SafetyReport } from "./types";

export function AdminReports({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<
    SafetyReport,
    "reports"
  > | null>(null);
  const [selected, setSelected] = useState<SafetyReport | null>(null);
  const [decision, setDecision] = useState<"resolved" | "dismissed">(
    "resolved",
  );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const query = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) query.set("status", status);
    try {
      setResult(
        await apiRequest<PageResult<SafetyReport, "reports">>(
          `/admin/reports?${query}`,
          { auth: true },
        ),
      );
      setError(null);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  }, [page, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/reports/${selected.id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ status: decision, note: note.trim() }),
      });
      setSelected(null);
      setNote("");
      await load();
      onChanged();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="admin-reports-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="admin-reports-title" className="text-xl font-bold">
            Safety reports
          </h2>
          <p className="mt-1 text-sm text-muted">
            Read the report, investigate relevant accounts or listings, then
            record a resolution.
          </p>
        </div>
        <div>
          <label htmlFor="report-status" className="mr-2 text-sm font-semibold">
            Status
          </label>
          <select
            id="report-status"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="h-11 rounded-control border border-border bg-surface px-3 text-sm"
          >
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="">All</option>
          </select>
        </div>
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
      <div className="mt-5 space-y-3">
        {result?.reports.map((report) => (
          <article
            key={report.id}
            className="rounded-card border border-border bg-surface p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {report.category.replaceAll("_", " ")} · {report.status}
                </p>
                <h3 className="mt-1 font-bold">
                  Report by {report.reporterName}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {new Date(report.createdAt).toLocaleString("en-ZA")}
                </p>
              </div>
              {report.status === "open" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(report);
                    setDecision("resolved");
                    setNote("");
                  }}
                  className="min-h-10 rounded-control bg-primary px-4 text-sm font-semibold text-white"
                >
                  Review
                </button>
              )}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
              {report.details}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              {report.subjectUserId && (
                <span>
                  Reported account: {report.subjectName || report.subjectUserId}
                </span>
              )}
              {report.productId && (
                <Link
                  href={`/products/${report.productId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary underline"
                >
                  View listing
                </Link>
              )}
            </div>
            {report.resolutionNote && (
              <p className="mt-4 border-t border-border pt-3 text-sm text-muted">
                Decision note: {report.resolutionNote}
              </p>
            )}
          </article>
        ))}
        {result?.reports.length === 0 && (
          <p className="rounded-card border border-border bg-surface p-8 text-center text-muted">
            No reports in this view.
          </p>
        )}
        {!result && !error && (
          <p role="status" className="text-sm text-muted">
            Loading reports...
          </p>
        )}
      </div>
      {result && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>{result.total} reports</span>
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4">
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-decision-title"
            className="w-full max-w-md rounded-card bg-surface p-6 shadow-xl"
          >
            <h3 id="report-decision-title" className="text-lg font-bold">
              Decide safety report
            </h3>
            <p className="mt-2 text-sm text-muted">
              Record what was checked and why this decision was made. The
              reporter will see this note.
            </p>
            <label
              htmlFor="report-decision"
              className="mt-5 block text-sm font-semibold"
            >
              Decision
            </label>
            <select
              id="report-decision"
              value={decision}
              onChange={(event) =>
                setDecision(event.target.value as "resolved" | "dismissed")
              }
              className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"
            >
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <label
              htmlFor="report-note"
              className="mt-4 block text-sm font-semibold"
            >
              Resolution note
            </label>
            <textarea
              id="report-note"
              autoFocus
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm"
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
                className="rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-white"
              >
                {busy ? "Saving..." : "Save decision"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
