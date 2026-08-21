"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { apiErrorMessage, apiPublic } from "@/app/libs/api";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
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
    }
  }

  return <main className="mx-auto w-full max-w-md px-4 py-16"><h1 className="text-2xl font-bold">Reset your password</h1><p className="mt-2 text-sm text-muted">Enter the email address linked to your account.</p><form onSubmit={submit} className="mt-6 space-y-4"><input name="email" type="email" required placeholder="you@example.com" className="w-full rounded-control border border-border px-4 py-3" />{message && <p className="text-sm text-secondary">{message}</p>}{error && <p role="alert" className="text-sm text-danger">{error}</p>}<button className="w-full rounded-control bg-primary px-4 py-3 font-semibold text-white">Send reset link</button></form><Link href="/login" className="mt-5 block text-center text-sm font-semibold text-primary">Back to sign in</Link></main>;
}
