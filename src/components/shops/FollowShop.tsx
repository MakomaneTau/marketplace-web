"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, apiErrorMessage } from "@/lib/api";

export function FollowShop({ slug }: { slug: string }) {
  const { auth, ready } = useAuth();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!auth) return;
    const controller = new AbortController();
    apiRequest<{ shop: { slug: string } }[]>("/follows", {
      auth: true,
      signal: controller.signal,
    })
      .then((rows) => setFollowing(rows.some((row) => row.shop.slug === slug)))
      .catch((failure) => {
        if (!controller.signal.aborted) setError(apiErrorMessage(failure));
      });
    return () => controller.abort();
  }, [auth, slug]);
  async function toggle() {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/follows/${encodeURIComponent(slug)}`, {
        auth: true,
        method: following ? "DELETE" : "PUT",
      });
      setFollowing(!following);
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  if (!ready || (auth && following === null && !error))
    return <LoadingSplash compact label="Checking shop follow status…" />;
  if (!auth)
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/shops/${slug}`)}`}
        className="mt-4 inline-block text-sm font-semibold text-primary-text underline"
      >
        Sign in to follow this shop
      </Link>
    );
  return (
    <div className="mt-4">
      <button
        disabled={busy || (following === null && !error)}
        onClick={toggle}
        aria-pressed={following === true}
        className="rounded-control border border-primary-text px-4 py-2 text-sm font-semibold text-primary-text disabled:opacity-50"
      >
        {following ? "Following · Unfollow" : "Follow shop"}
      </button>
      <p className="mt-2 text-xs text-muted">
        New listings appear in your alerts.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
