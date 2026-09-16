"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, LockKeyhole, LogIn, Mail } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { apiErrorMessage, login } from "@/app/libs/api";

export function LoginForm({ sessionExpired = false }: { sessionExpired?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await login(email, password, remember);
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const safeRequestedPath =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//") && !/[\\\x00-\x1f\x7f]/.test(requestedPath)
          ? requestedPath
          : null;
      router.replace(safeRequestedPath || (result.profile?.role === "seller" ? "/seller" : "/"));
      router.refresh();
    } catch (error) {
      setError(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sessionExpired && !error && (
        <div role="status" className="flex gap-3 rounded-control border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>Your session ended. Sign in again to continue.</p>
        </div>
      )}
      <Input
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Enter your email"
        icon={<Mail className="size-4" />}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <div>
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={<LockKeyhole className="size-4" />}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="mt-1 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Remember me */}

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="
            size-4
            rounded
            border-border
            accent-primary
          "
        />

        <span className="text-sm text-muted">Keep me signed in</span>
      </label>

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

      <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
        <LogIn className="size-5" aria-hidden="true" />
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
