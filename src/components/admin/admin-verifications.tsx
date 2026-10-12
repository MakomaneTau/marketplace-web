"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";

import { apiErrorMessage, apiRequest } from "@/lib/api";

import type { PageResult, SellerVerification } from "./types";

type ImageLinks = { selfieUrl: string; identityUrl: string; expiresIn: number };

function dateTime(value: string) {
  return new Date(value).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminVerifications({ onChanged }: { onChanged: () => void }) {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<SellerVerification, "verifications"> | null>(null);
  const [selected, setSelected] = useState<SellerVerification | null>(null);
  const [images, setImages] = useState<ImageLinks | null>(null);
  const [decision, setDecision] = useState<"verified" | "rejected">("verified");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const query = new URLSearchParams({ page: String(page), limit: "20", status });
    try {
      setResult(await apiRequest<PageResult<SellerVerification, "verifications">>(`/admin/verifications?${query}`, { auth: true }));
      setError(null);
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
  }, [page, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  function changeStatus(next: string) {
    setPage(1);
    setResult(null);
    setStatus(next);
  }

  async function loadImages(verification: SellerVerification) {
    setImages(null);
    setError(null);
    try { setImages(await apiRequest<ImageLinks>(`/admin/verifications/${verification.id}/images`, { auth: true })); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
  }

  async function open(verification: SellerVerification) {
    setSelected(verification);
    setReason("");
    setDecision("verified");
    await loadImages(verification);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/verifications/${selected.id}`, { method: "PATCH", auth: true, body: JSON.stringify({ status: decision, reason: reason.trim() }) });
      setSelected(null);
      setImages(null);
      await load();
      onChanged();
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setBusy(false); }
  }

  return (
    <section aria-labelledby="admin-verifications-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="admin-verifications-title" className="text-xl font-bold">Seller verification</h2>
          <p className="mt-1 text-sm text-muted">Review pending requests and see the history of approved or rejected submissions.</p>
        </div>
        {status !== "pending" && <label htmlFor="verification-status" className="flex items-center gap-2 text-sm font-semibold">
          Show
          <select id="verification-status" value={status} onChange={(event) => changeStatus(event.target.value)} className="h-11 rounded-control border border-border bg-surface px-3 font-normal">
            <option value="resolved">All decisions</option>
            <option value="verified">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>}
      </div>

      <div role="group" aria-label="Verification views" className="mt-5 flex gap-2 border-b border-border">
        <button type="button" aria-pressed={status === "pending"} onClick={() => changeStatus("pending")} className={`border-b-2 px-3 py-3 text-sm font-semibold ${status === "pending" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>Pending review</button>
        <button type="button" aria-pressed={status !== "pending"} onClick={() => changeStatus("resolved")} className={`border-b-2 px-3 py-3 text-sm font-semibold ${status !== "pending" ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>Resolved history</button>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-danger">{error} <button type="button" onClick={() => void load()} className="font-semibold underline">Retry</button></p>}
      <div className="mt-5 divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
        {result?.verifications.map((verification) => (
          <article key={verification.id} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{verification.sellerName}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${verification.status === "verified" ? "bg-emerald-50 text-emerald-700" : verification.status === "rejected" ? "bg-red-50 text-red-700" : "bg-primary-soft text-primary"}`}>
                  {verification.status === "verified" ? "Approved" : verification.status === "rejected" ? "Rejected" : "Pending"}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-muted">Seller ID: {verification.sellerId}</p>
              <p className="mt-2 text-sm text-muted">Submitted {dateTime(verification.createdAt)}{verification.reviewedAt && <> · Decided {dateTime(verification.reviewedAt)}</>}</p>
              {verification.rejectionReason && <p className="mt-2 max-w-2xl text-sm text-foreground"><span className="font-semibold">Reason:</span> {verification.rejectionReason}</p>}
            </div>
            <button type="button" onClick={() => void open(verification)} className="min-h-10 rounded-control border border-border px-4 text-sm font-semibold hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{verification.status === "pending" ? "Review" : "View details"}</button>
          </article>
        ))}
        {result?.verifications.length === 0 && <p className="p-8 text-center text-muted">{status === "pending" ? "No requests awaiting review. Check resolved history for past decisions." : "No resolved verification requests in this view."}</p>}
        {!result && !error && <p role="status" className="p-8 text-center text-muted">Loading verification requests...</p>}
      </div>

      {result && <div className="mt-4 flex items-center justify-between text-sm text-muted"><span>{result.total} {status === "pending" ? "pending" : "resolved"} requests</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-control border border-border px-3 py-2 disabled:opacity-40">Previous</button><span className="px-2 py-2">Page {page}</span><button type="button" disabled={page * 20 >= result.total} onClick={() => setPage(page + 1)} className="rounded-control border border-border px-3 py-2 disabled:opacity-40">Next</button></div></div>}

      {selected && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 px-4 py-6">
        <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="verification-review-title" className="w-full max-w-lg rounded-card bg-surface p-6 shadow-xl">
          <h3 id="verification-review-title" className="text-lg font-bold">Verification for {selected.sellerName}</h3>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-semibold">Status</dt><dd className="capitalize">{selected.status === "verified" ? "Approved" : selected.status}</dd>
            <dt className="font-semibold">Submitted</dt><dd>{dateTime(selected.createdAt)}</dd>
            {selected.reviewedAt && <><dt className="font-semibold">Decided</dt><dd>{dateTime(selected.reviewedAt)}</dd></>}
            {selected.rejectionReason && <><dt className="font-semibold">Reason</dt><dd className="whitespace-pre-wrap break-words">{selected.rejectionReason}</dd></>}
            <dt className="font-semibold">Request ID</dt><dd className="break-all font-mono text-xs">{selected.id}</dd>
          </dl>
          <p className="mt-4 text-sm text-muted">These identity images are sensitive. Open only for this review and do not download or share them.</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">{images ? <><a href={images.selfieUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">View selfie</a><a href={images.identityUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">View identity document</a><button type="button" onClick={() => void loadImages(selected)} className="font-semibold text-primary underline">Refresh links</button></> : <button type="button" onClick={() => void loadImages(selected)} className="font-semibold text-primary underline">Load private previews</button>}</div>
          {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
          {selected.status === "pending" && <><label htmlFor="verification-decision" className="mt-5 block text-sm font-semibold">Decision</label><select id="verification-decision" value={decision} onChange={(event) => setDecision(event.target.value as "verified" | "rejected")} className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm"><option value="verified">Approve</option><option value="rejected">Reject</option></select>{decision === "rejected" && <><label htmlFor="verification-reason" className="mt-4 block text-sm font-semibold">Reason shown to seller</label><textarea id="verification-reason" required minLength={10} maxLength={500} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-control border border-border bg-surface p-3 text-sm" /></>}</>}
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => { setSelected(null); setImages(null); }} disabled={busy} className="rounded-control px-4 py-2.5 text-sm font-semibold">Close</button>{selected.status === "pending" && <button type="submit" disabled={busy || !images} className="rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : "Save decision"}</button>}</div>
        </form>
      </div>}
    </section>
  );
}
