"use client";

import { useEffect, useState, type ReactNode, type FormEvent } from "react";

import { apiRequest, apiErrorMessage, logout } from "@/lib/api";
import { LoadingSplash } from "@/components/ui/LoadingSplash";

type Status = { verified: boolean; factors: { id: string; name: string }[] };

export function AdminMfa({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [factorId, setFactorId] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<Status>("/auth/mfa/status", { auth: true })
      .then((value) => {
        if (!active) return;
        setStatus(value);
        setFactorId(value.factors[0]?.id || "");
      })
      .catch((reason) => {
        if (active) setError(apiErrorMessage(reason));
      });
    return () => {
      active = false;
    };
  }, []);

  async function enroll() {
    setBusy(true);
    setError(null);
    try {
      const factor = await apiRequest<{ id: string; secret: string }>(
        "/auth/mfa/enroll",
        { method: "POST", auth: true },
      );
      setFactorId(factor.id);
      setSecret(factor.secret);
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiRequest("/auth/mfa/verify", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ factorId, code }),
      });
      setSecret("");
      setCode("");
      const value = await apiRequest<Status>("/auth/mfa/status", {
        auth: true,
      });
      setStatus(value);
      if (!value.verified)
        setError("Verification did not complete. Please try again.");
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    try {
      await logout();
      window.location.replace("/login");
    } catch (reason) {
      setError(apiErrorMessage(reason));
      setBusy(false);
    }
  }

  if (status?.verified) return children;
  if (!status && !error)
    return <LoadingSplash label="Checking account security…" />;
  return (
    <section className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-bold">Secure your admin account</h1>
      <p className="mt-3 text-muted">
        Admin tools require a code from your authenticator app each time you
        sign in.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-danger">
          {error}
        </p>
      )}
      {!status && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 underline"
        >
          Try again
        </button>
      )}
      {status && !factorId && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void enroll()}
          className="mt-6 rounded-control bg-primary px-5 py-3 font-semibold disabled:opacity-50"
        >
          {busy ? "Preparing setup…" : "Set up authenticator"}
        </button>
      )}
      {secret && (
        <div className="mt-6 rounded-control border border-border p-4">
          <p>
            Add a time-based account in your authenticator app and enter this
            setup key. Keep it private.
          </p>
          <code className="mt-3 block break-all select-all font-mono">
            {secret}
          </code>
        </div>
      )}
      {factorId && (
        <form onSubmit={verify} className="mt-6 space-y-4">
          {status && status.factors.length > 1 && (
            <label className="block">
              Authenticator
              <select
                value={factorId}
                onChange={(event) => setFactorId(event.target.value)}
                className="mt-2 block w-full rounded-control border border-border p-3"
              >
                {status.factors.map((factor) => (
                  <option key={factor.id} value={factor.id}>
                    {factor.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block" htmlFor="admin-mfa-code">
            Six-digit code
          </label>
          <input
            id="admin-mfa-code"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className="w-full rounded-control border border-border bg-surface px-4 py-3 text-lg tracking-widest"
          />
          <button
            disabled={busy || code.length !== 6}
            className="rounded-control bg-primary px-5 py-3 font-semibold disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      )}
      <p className="mt-6 text-sm text-muted">
        Lost your authenticator? Ask the platform owner to verify your identity
        and reset your factor through the secure support process.
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={busy}
        className="mt-5 underline disabled:opacity-50"
      >
        Log out
      </button>
    </section>
  );
}
