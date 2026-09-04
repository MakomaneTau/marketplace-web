"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";

import { AuthShell } from "@/app/components/auth/AuthShell";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import {
  ApiClientError,
  apiErrorMessage,
  resetPassword,
} from "@/app/libs/api";

type RecoveryState =
  | { status: "checking" }
  | { status: "invalid" }
  | { status: "ready"; accessToken: string }
  | { status: "success" };

const INVALID_LINK_MESSAGE =
  "This password reset link is invalid or has expired. Request a new link to continue.";

export default function ResetPasswordPage() {
  const [recovery, setRecovery] = useState<RecoveryState>({ status: "checking" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function readRecoveryLink() {
      const parameters = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = parameters.get("access_token");
      const recoveryType = parameters.get("type");
      const expiresAt = Number(parameters.get("expires_at"));
      const isExpired = Number.isFinite(expiresAt) && expiresAt > 0
        ? expiresAt * 1000 <= Date.now()
        : false;

      if (recoveryType === "recovery" && accessToken && !isExpired) {
        setRecovery({ status: "ready", accessToken });
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      setRecovery({ status: "invalid" });
      window.history.replaceState(null, "", window.location.pathname);
    }

    readRecoveryLink();
    window.addEventListener("hashchange", readRecoveryLink);

    return () => window.removeEventListener("hashchange", readRecoveryLink);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (recovery.status !== "ready") return;

    if (password.trim().length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(password, recovery.accessToken);
      window.history.replaceState(null, "", window.location.pathname);
      setPassword("");
      setConfirmPassword("");
      setRecovery({ status: "success" });
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.status === 401) {
        window.history.replaceState(null, "", window.location.pathname);
        setRecovery({ status: "invalid" });
        setError(null);
        return;
      }

      setError(apiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      description="Enter a new password for your Marketplace account."
      footerText="Remembered your password?"
      footerLinkText="Sign in"
      footerHref="/login"
    >
      {recovery.status === "checking" && (
        <p role="status" className="text-sm text-muted">
          Checking your password reset link...
        </p>
      )}

      {recovery.status === "invalid" && (
        <div className="space-y-5">
          <p role="alert" className="rounded-control border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
            {INVALID_LINK_MESSAGE}
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex h-11 w-full items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Request another reset link
          </Link>
        </div>
      )}

      {recovery.status === "ready" && (
        <form onSubmit={submit} className="space-y-5">
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="Use at least 8 characters."
            required
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          {error && (
            <p role="alert" className="rounded-control border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Updating password..." : "Update password"}
          </Button>
        </form>
      )}

      {recovery.status === "success" && (
        <div className="space-y-5">
          <p role="status" className="rounded-control border border-secondary/20 bg-secondary-soft px-4 py-3 text-sm text-secondary">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Continue to sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
