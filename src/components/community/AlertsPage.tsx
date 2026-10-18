"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { apiRequest, apiErrorMessage } from "@/lib/api";
import { Container } from "@/components/layout/Container";

type Notice = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};
type Saved = { id: string; name: string; filters: Record<string, string> };
type Follow = { shop: { id: string; name: string; slug: string } };
export function AlertsPage() {
  const [notices, setNotices] = useState<Notice[]>([]),
    [searches, setSearches] = useState<Saved[]>([]),
    [follows, setFollows] = useState<Follow[]>([]);
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const [n, s, f] = await Promise.all([
        apiRequest<Notice[]>("/notifications?limit=100", { auth: true }),
        apiRequest<Saved[]>("/saved-searches", { auth: true }),
        apiRequest<Follow[]>("/follows", { auth: true }),
      ]);
      setNotices(n);
      setSearches(s);
      setFollows(f);
      setError("");
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 30000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [load]);
  async function action(path: string, method: string) {
    setBusy(true);
    try {
      await apiRequest(path, { auth: true, method });
      await load();
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-black">Your alerts</h1>
      <p className="mt-2 text-muted">
        New finds, price drops and updates from the shops you follow.
      </p>
      {error && (
        <p role="alert" className="my-4 text-danger">
          {error}{" "}
          <button onClick={load} className="underline">
            Retry
          </button>
        </p>
      )}
      {loading ? (
        <LoadingSplash compact label="Loading alerts…" />
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Latest updates</h2>
              <button
                disabled={busy}
                onClick={() => action("/notifications/read-all", "PATCH")}
                className="text-sm font-semibold text-primary-text"
              >
                Mark all read
              </button>
            </div>
            {!notices.length && (
              <p className="py-8 text-muted">
                No alerts yet. Save a search or follow a shop to hear about new
                listings. Favourites also notify you when prices drop.
              </p>
            )}
            <div className="divide-y divide-border">
              {notices.map((n) => (
                <article key={n.id} className="py-5">
                  <h3
                    className={
                      n.read_at ? "font-semibold text-muted" : "font-bold"
                    }
                  >
                    {n.title}
                    {!n.read_at && (
                      <span className="ml-2 text-xs text-primary-text">
                        New
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{n.body}</p>
                  <div className="mt-2 flex gap-4 text-sm">
                    {n.href?.startsWith("/") && !n.href.startsWith("//") && (
                      <Link
                        href={n.href}
                        className="font-semibold text-primary-text"
                      >
                        View update
                      </Link>
                    )}
                    {!n.read_at && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          action(`/notifications/${n.id}/read`, "PATCH")
                        }
                        className="text-muted underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
          <aside className="space-y-8">
            <section>
              <h2 className="text-xl font-bold">Saved searches</h2>
              {!searches.length && (
                <p className="mt-3 text-sm text-muted">
                  Save a search from the results page.
                </p>
              )}
              {searches.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-4"
                >
                  <Link
                    className="text-sm font-semibold text-primary-text"
                    href={`/search?${new URLSearchParams(s.filters)}`}
                  >
                    {s.name}
                  </Link>
                  <button
                    disabled={busy}
                    onClick={() => action(`/saved-searches/${s.id}`, "DELETE")}
                    className="text-xs text-muted underline"
                    aria-label={`Remove saved search ${s.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>
            <section>
              <h2 className="text-xl font-bold">Following</h2>
              {!follows.length && (
                <p className="mt-3 text-sm text-muted">
                  Follow a shop from its storefront.
                </p>
              )}
              {follows.map((f) => (
                <div
                  key={f.shop.id}
                  className="flex justify-between gap-3 border-b border-border py-4"
                >
                  <Link
                    href={`/shops/${f.shop.slug}`}
                    className="text-sm font-semibold text-primary-text"
                  >
                    {f.shop.name}
                  </Link>
                  <button
                    disabled={busy}
                    onClick={() => action(`/follows/${f.shop.slug}`, "DELETE")}
                    className="text-xs text-muted underline"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </section>
          </aside>
        </div>
      )}
    </Container>
  );
}
