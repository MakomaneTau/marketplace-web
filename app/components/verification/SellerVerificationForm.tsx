"use client";

import {
  type FormEvent,
  useState,
} from "react";
import {
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";


import { Button } from "@/app/components/ui/Button";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

import { ImageUploadField } from "./ImageUploadField";

export function SellerVerificationForm() {
  const [selfie, setSelfie] =
    useState<File | null>(null);

  const [sellerId, setSellerId] =
    useState<File | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!selfie) {
      setError(
        "Please upload a clear photo of yourself.",
      );
      return;
    }

    if (!sellerId) {
      setError(
        "Please upload your ID card.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append(
        "selfie",
        selfie,
      );

      formData.append(
        "sellerId",
        sellerId,
      );

      await apiRequest("/verifications/seller", { method: "POST", auth: true, body: formData });
      setSubmitted(true);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Temporary submitted state.
   */

  if (submitted) {
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
          Verification submitted
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          Your documents have been submitted
          for verification.
        </p>

        <Button
          type="button"
          className="mt-6"
          fullWidth
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
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
            text-primary
          "
        />

        <div>
          <p className="text-sm font-semibold text-foreground">
            Verification documents
          </p>

          <p className="mt-1 text-xs leading-5 text-muted">
            These images are used to help verify
            that you are an eligible vendor.
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
        disabled={
          isSubmitting ||
          !selfie ||
          !sellerId
        }
      >
        {isSubmitting
          ? "Uploading..."
          : "Submit verification"}
      </Button>

      <p className="text-center text-xs leading-5 text-muted">
        Make sure both images are clear before
        submitting.
      </p>
    </form>
  );
}
