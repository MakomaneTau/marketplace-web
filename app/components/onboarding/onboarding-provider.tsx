"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/app/hooks/use-auth";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

import { OnboardingExperience } from "./onboarding-experience";
import type { OnboardingRole, OnboardingState } from "./onboarding-types";

interface OnboardingContextValue {
  open: () => void;
  refresh: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children, role }: { children: ReactNode; role: OnboardingRole }) {
  const pathname = usePathname();
  const { auth, ready } = useAuth();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const initializedUser = useRef<string | null>(null);

  const matchesRole = ready && auth?.profile?.role === role;

  const load = useCallback(async () => {
    if (!matchesRole || !auth) return;
    setLoading(true);
    setError(null);
    try {
      const next = await apiRequest<OnboardingState>("/onboarding", { auth: true });
      setState(next);
      if (initializedUser.current !== auth.user.id) {
        initializedUser.current = auth.user.id;
        setWelcomeOpen(!next.welcomeSeen);
        setPanelOpen(next.welcomeSeen && !next.dismissed);
      }
    } catch (loadError) {
      setError(apiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [auth, matchesRole]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load, pathname]);

  const update = useCallback(async (input: { welcomeSeen?: true; dismissed?: boolean }) => {
    setSaving(true);
    setError(null);
    try {
      const next = await apiRequest<OnboardingState>("/onboarding", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(input),
      });
      setState(next);
      return true;
    } catch (updateError) {
      setError(apiErrorMessage(updateError));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const open = useCallback(() => {
    setWelcomeOpen(false);
    setPanelOpen(true);
    if (state?.dismissed) void update({ dismissed: false });
  }, [state?.dismissed, update]);

  const contextValue = useMemo(() => ({ open, refresh: () => void load() }), [load, open]);

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      {matchesRole && (
        <OnboardingExperience
          role={role}
          state={state}
          loading={loading}
          saving={saving}
          error={error}
          panelOpen={panelOpen}
          welcomeOpen={welcomeOpen}
          onOpen={open}
          onRetry={() => void load()}
          onStart={async () => {
            if (await update({ welcomeSeen: true, dismissed: false })) {
              setWelcomeOpen(false);
              setPanelOpen(true);
            }
          }}
          onSkip={async () => {
            if (await update({ welcomeSeen: true, dismissed: true })) {
              setWelcomeOpen(false);
              setPanelOpen(false);
            }
          }}
          onDismiss={async () => {
            setPanelOpen(false);
            await update({ dismissed: true });
          }}
        />
      )}
    </OnboardingContext.Provider>
  );
}
