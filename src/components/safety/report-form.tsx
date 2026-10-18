"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { useAuth } from "@/hooks/use-auth";
import { apiErrorMessage, apiRequest } from "@/lib/api";

type OwnReport = {
  id: string;
  category: string;
  status: string;
  createdAt: string;
  resolutionNote: string | null;
};

export function ReportForm({ productId }: { productId?: string }) {
  const { auth, ready } = useAuth();
  const [category, setCategory] = useState("scam");
  const [details, setDetails] = useState("");
  const [subjectUserId, setSubjectUserId] = useState("");
  const [reports, setReports] = useState<OwnReport[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !auth) return;
    apiRequest<OwnReport[]>("/reports", { auth: true })
      .then(setReports)
      .catch(() => {});
  }, [ready, auth]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiRequest<{ id: string }>("/reports", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          category,
          details,
          subjectUserId: subjectUserId.trim() || null,
          productId: productId || null,
        }),
      });
      setDetails("");
      setSubjectUserId("");
      setSuccess(`Report submitted. Reference: ${result.id}`);
      setReports(await apiRequest<OwnReport[]>("/reports", { auth: true }));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <LoadingSplash compact label="Checking your session..." />;
  if (!auth)
    return (
      <p className="text-sm text-muted">
        <Link
          href="/login?next=/report"
          className="font-semibold text-primary-text underline"
        >
          Sign in
        </Link>{" "}
        to submit and track a report.
      </p>
    );

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="space-y-4 rounded-card border border-border bg-surface p-5 sm:p-6"
      >
        <div>
          <h2 className="text-lg font-bold">Submit a safety report</h2>
          <p className="mt-1 text-sm text-muted">
            Our team will review it. Do not include passwords, payment details
            or identity documents.
          </p>
        </div>
        {productId && (
          <p className="rounded-control bg-surface-muted px-3 py-2 text-xs text-muted">
            Listing attached: {productId}
          </p>
        )}
        <label className="block text-sm font-medium" htmlFor="report-category">
          What happened?
        </label>
        <select
          id="report-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"
        >
          <option value="scam">Suspected scam</option>
          <option value="harassment">Harassment or threats</option>
          <option value="unsafe_listing">Unsafe or misleading listing</option>
          <option value="other">Other safety concern</option>
        </select>
        <label className="block text-sm font-medium" htmlFor="report-user">
          Account ID (optional)
        </label>
        <input
          id="report-user"
          value={subjectUserId}
          onChange={(event) => setSubjectUserId(event.target.value)}
          placeholder="Paste an account ID if known"
          className="h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"
        />
        <label className="block text-sm font-medium" htmlFor="report-details">
          Details
        </label>
        <textarea
          id="report-details"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Describe what happened, when, and any relevant listing or order reference."
          className="w-full rounded-control border border-border bg-surface p-3 text-sm"
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-sm text-success">
            {success}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-control bg-primary-action px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "Submitting..." : "Submit report"}
        </button>
      </form>
      {reports.length > 0 && (
        <section
          aria-labelledby="my-reports-heading"
          className="rounded-card border border-border bg-surface p-5 sm:p-6"
        >
          <h2 id="my-reports-heading" className="font-bold">
            Your recent reports
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {reports.map((report) => (
              <li key={report.id} className="py-3 text-sm">
                <span className="font-semibold capitalize">
                  {report.category.replaceAll("_", " ")}
                </span>
                <span className="ml-2 text-muted">
                  {report.status} ·{" "}
                  {new Date(report.createdAt).toLocaleDateString("en-ZA")}
                </span>
                {report.resolutionNote && (
                  <p className="mt-1 text-muted">{report.resolutionNote}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
