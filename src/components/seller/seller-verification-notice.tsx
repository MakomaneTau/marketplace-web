"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";

type Submission = {
  status: "pending" | "verified" | "rejected";
  rejectionReason: string | null;
};

export function SellerVerificationNotice() {
  const { auth } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const profile = auth?.profile;

  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (profile?.role !== "seller" || profile.verificationStatus === "verified")
      return;
    let active = true;
    apiRequest<Submission | null>("/verifications/seller", { auth: true })
      .then((result) => {
        if (active) setSubmission(result);
      })
      .catch(() => {
        /* The deadline notice must remain visible if request status is unavailable. */
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [profile?.role, profile?.verificationStatus, auth?.user.id]);

  if (profile?.role !== "seller" || profile.verificationStatus === "verified")
    return null;

  const createdAt = profile.createdAt ? new Date(profile.createdAt) : null;
  const deadline =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      : null;
  const remaining = deadline && now !== null ? deadline.getTime() - now : null;
  const expired = remaining !== null && remaining <= 0;
  const days =
    remaining !== null ? Math.ceil(remaining / (24 * 60 * 60 * 1000)) : null;
  const pending = submission?.status === "pending";
  const rejected = submission?.status === "rejected";

  return (
    <section
      aria-labelledby="seller-verification-title"
      className={`mb-6 flex flex-wrap items-start justify-between gap-4 rounded-card border p-4 sm:p-5 ${rejected ? "border-danger/25 bg-red-50" : "border-primary/25 bg-primary-soft"}`}
    >
      <div className="flex max-w-3xl gap-3">
        {rejected ? (
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-danger"
            aria-hidden="true"
          />
        ) : (
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-primary-text"
            aria-hidden="true"
          />
        )}
        <div>
          <h2
            id="seller-verification-title"
            className="font-bold text-foreground"
          >
            {rejected
              ? "Verification needs another submission"
              : expired
                ? "Selling paused until admin approval"
                : "Verify your seller account"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-foreground">
            {expired
              ? "Your seven-day selling period has ended. Your shop and listings are hidden from buyers, and new orders are paused until an admin approves your verification. You can still manage existing orders."
              : `You can set up your shop and sell for ${days ?? "up to 7"} more ${days === 1 ? "day" : "days"} without approval. After that, an admin must approve your verification before buyers can see your listings or place new orders.`}
          </p>
          {deadline && (
            <p className="mt-1 text-xs text-muted">
              Approval required from{" "}
              {deadline.toLocaleString("en-ZA", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              .
            </p>
          )}
          {pending && (
            <p className="mt-2 text-sm font-semibold text-primary-text">
              Documents submitted. Waiting for admin review.
            </p>
          )}
          {rejected && (
            <div className="mt-3 rounded-control border border-danger/20 bg-surface p-3 text-sm">
              <p className="font-semibold text-foreground">
                Why it was rejected
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words leading-6 text-foreground">
                {submission.rejectionReason ||
                  "No reason was provided. Review the document requirements before resubmitting."}
              </p>
              <p className="mt-2 text-muted">
                Review this feedback, then upload a new selfie and ID document
                for another admin review.
              </p>
            </div>
          )}
          {!loaded && (
            <LoadingSplash compact label="Checking submission status..." />
          )}
        </div>
      </div>
      <Link
        href="/signup/verification"
        className="inline-flex min-h-11 items-center rounded-control bg-primary-action px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
      >
        {pending
          ? "View submission"
          : rejected
            ? "Review feedback and resubmit"
            : "Submit documents"}
      </Link>
    </section>
  );
}
