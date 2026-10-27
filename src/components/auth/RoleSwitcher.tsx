"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { apiErrorMessage, switchRole } from "@/lib/api";
import { roleHome } from "@/lib/role-access";

export function RoleSwitcher() {
  const { auth, ready } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!ready || !auth?.profile || auth.profile.isAdmin) return null;
  const target = auth.profile.role === "seller" ? "buyer" : "seller";

  async function handleSwitch() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const updated = await switchRole(target);
      // Reload the workspace so cached pages and role-specific providers reset.
      window.location.replace(roleHome(updated.profile));
    } catch (cause) {
      setError(apiErrorMessage(cause));
      setPending(false);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleSwitch()}
        className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary-text disabled:cursor-wait disabled:opacity-60"
      >
        <ArrowLeftRight className="size-4 shrink-0" aria-hidden="true" />
        {pending
          ? "Switching..."
          : `Switch to ${target === "seller" ? "selling" : "buying"}`}
      </button>
      {error && (
        <p role="alert" className="mt-2 max-w-xs text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
