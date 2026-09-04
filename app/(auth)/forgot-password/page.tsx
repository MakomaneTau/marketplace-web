"use client";

import { FormEvent, useState } from "react";

import { AuthShell } from "@/app/components/auth/AuthShell";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { apiErrorMessage, apiPublic } from "@/app/libs/api";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const form = new FormData(event.currentTarget);
      await apiPublic("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      setMessage("If that email exists, a password reset link has been sent.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the email address linked to your Marketplace account."
      footerText="Remembered your password?"
      footerLinkText="Sign in"
      footerHref="/login"
    >
      <form onSubmit={submit} className="space-y-5">
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          required
        />

        {message && (
          <p role="status" className="rounded-control border border-secondary/20 bg-secondary-soft px-4 py-3 text-sm text-secondary">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-control border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
