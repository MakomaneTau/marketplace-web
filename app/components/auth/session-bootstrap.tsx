"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ShoppingBag } from "lucide-react";

import { AuthContext } from "@/app/hooks/use-auth";
import { clearLegacyBrowserSession, getCurrentAuth, getStoredAuth, type StoredAuth } from "@/app/libs/api";

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ auth: StoredAuth | null; ready: boolean }>({
    auth: null,
    ready: false,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let active = true;
    clearLegacyBrowserSession();

    const sync = () => {
      if (!active) return;
      setState({ auth: getStoredAuth(), ready: true });
      setInitialized(true);
    };

    const load = () => {
      setState((current) => ({ ...current, ready: false }));
      getCurrentAuth().then(sync).catch(() => {
        if (!active) return;
        // Public browsing remains available when the account service is offline.
        setState({ auth: null, ready: true });
        setInitialized(true);
      });
    };

    window.addEventListener("marketplace-auth", sync);
    window.addEventListener("marketplace-auth-loading", load);
    load();

    return () => {
      active = false;
      window.removeEventListener("marketplace-auth", sync);
      window.removeEventListener("marketplace-auth-loading", load);
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {initialized && <div inert={!state.ready} aria-hidden={!state.ready || undefined}>{children}</div>}
      {!state.ready && (
        <div className="fixed inset-0 z-[100] grid min-h-dvh place-items-center bg-background px-6 text-center">
          <div className="max-w-md" role="status" aria-live="polite">
            <ShoppingBag className="mx-auto size-12 text-primary" aria-hidden="true" />
            <p className="mt-4 text-2xl font-bold text-foreground">Marketplace</p>
            <span className="mx-auto mt-6 block size-8 animate-spin rounded-full border-4 border-primary-soft border-t-primary motion-reduce:animate-none" aria-hidden="true" />
            <p className="mt-3 text-muted">Getting your marketplace ready...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
