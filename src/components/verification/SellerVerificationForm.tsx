"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { ProtectedRequestError } from "@/components/auth/protected-request-error";
import { Button } from "@/components/ui/Button";
import { apiErrorMessage, apiRequest, SESSION_ERROR_MESSAGE } from "@/lib/api";

import { ImageUploadField } from "./ImageUploadField";

export function SellerVerificationForm() {
  const [current, setCurrent] = useState<{
    status: "pending" | "verified" | "rejected";
    rejectionReason: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selfie, setSelfie] = useState<File | null>(null);

  const [sellerId, setSellerId] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<typeof current>("/verifications/seller", { auth: true })
      .then((result) => {
        if (active) setCurrent(result);
      })
      .catch((requestError) => {
        if (active) setError(apiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!selfie) {
      setError("Please upload a clear photo of yourself.");
      return;
    }

    if (!sellerId) {
      setError("Please upload your ID card.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("selfie", selfie);

      formData.append("sellerId", sellerId);

      await apiRequest("/verifications/seller", {
        method: "POST",
        auth: true,
        body: formData,
      });
      setCurrent({ status: "pending", rejectionReason: null });
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <LoadingSplash label="Checking verification status..." />;
  if (error === SESSION_ERROR_MESSAGE)
    return <ProtectedRequestError message={error} />;

  if (current?.status === "pending" || current?.status === "verified") {
    return (
      <div
        className="
          rounded-card
          border
          border-border
          bg-surface
          p-6
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            size-14
            items-center
            justify-center
            rounded-full
            bg-secondary-soft
            text-secondary
          "
        >
          <CheckCircle2 className="size-7" />
        </div>

        <h2 className="mt-4 text-xl font-bold text-foreground">
          {current.status === "verified"
            ? "Verification approved"
            : "Verification submitted"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          {current.status === "verified"
            ? "An admin has approved your seller account."
            : "Your documents are waiting for admin review. You can continue selling during your seven-day grace period; after that, new sales pause until approval."}
        </p>

        <Link
          href="/seller"
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-primary-action px-5 font-semibold text-primary-foreground"
        >
          Back to seller centre
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {current?.status === "rejected" && (
        <section
          aria-labelledby="verification-feedback-title"
          className="rounded-card border border-danger/25 bg-red-50 p-4 sm:p-5"
        >
          <h2
            id="verification-feedback-title"
            className="font-bold text-foreground"
          >
            Your last submission was rejected
          </h2>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Admin feedback
          </p>
          <blockquote className="mt-1 whitespace-pre-wrap break-words rounded-control border border-danger/20 bg-surface p-3 text-sm leading-6 text-foreground">
            {current.rejectionReason ||
              "No reason was provided. Review the document requirements before resubmitting."}
          </blockquote>
          <p className="mt-3 text-sm leading-6 text-foreground">
            Use this feedback when preparing your new photos. Both images need
            to be uploaded again for admin review.
          </p>
        </section>
      )}
      {/* Security notice */}

      <div
        className="
          flex
          gap-3
          rounded-card
          border
          border-primary/20
          bg-primary-soft
          p-4
        "
      >
        <ShieldCheck
          className="
            mt-0.5
            size-5
            shrink-0
            text-primary-text
          "
        />

        <div>
          <p className="text-sm font-semibold text-foreground">
            Verification documents
          </p>

          <p className="mt-1 text-xs leading-5 text-muted">
            These images are used to help verify that you are an eligible
            vendor.
          </p>
        </div>
      </div>

      {/* Selfie */}

      <ImageUploadField
        title="Photo of yourself"
        description="Take or upload a clear photo showing your face."
        capture="user"
        variant="square"
        value={selfie}
        onChange={setSelfie}
      />

      {/* Student ID */}

      <ImageUploadField
        title="ID card"
        description="Upload a clear photo of your ID card with the important details visible."
        capture="environment"
        variant="card"
        value={sellerId}
        onChange={setSellerId}
      />

      {/* General error */}

      {error && (
        <div
          role="alert"
          className="
            rounded-control
            border
            border-danger/20
            bg-red-50
            px-4
            py-3
            text-sm
            text-danger
          "
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={isSubmitting || !selfie || !sellerId}
      >
        {isSubmitting ? "Uploading..." : "Submit verification"}
      </Button>

      <p className="text-center text-xs leading-5 text-muted">
        Make sure both images are clear before submitting.
      </p>
    </form>
  );
}
