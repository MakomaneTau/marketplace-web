"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import {
  onboardingSteps,
  type OnboardingRole,
  type OnboardingState,
} from "./onboarding-types";

interface ExperienceProps {
  role: OnboardingRole;
  state: OnboardingState | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  panelOpen: boolean;
  welcomeOpen: boolean;
  onOpen: () => void;
  onRetry: () => void;
  onStart: () => void;
  onSkip: () => void;
  onDismiss: () => void;
}

export function OnboardingExperience(props: ExperienceProps) {
  const steps = onboardingSteps[props.role];
  const completed = steps.filter((step) => props.state?.steps[step.id]).length;
  const allComplete = completed === steps.length;

  return (
    <div className={cn("contents", `${props.role}-theme`)}>
      {props.welcomeOpen && (
        <WelcomeDialog
          role={props.role}
          saving={props.saving}
          onStart={props.onStart}
          onSkip={props.onSkip}
        />
      )}

      {props.panelOpen && props.state && (
        <aside
          aria-labelledby="getting-started-title"
          className="fixed inset-x-3 bottom-24 z-40 max-h-[min(70vh,38rem)] overflow-y-auto rounded-card border border-border bg-surface shadow-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem]"
        >
          <div className="sticky top-0 border-b border-border bg-surface p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-text">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="getting-started-title" className="font-bold">
                  {allComplete ? "You're all set" : "Getting started"}
                </h2>
                <p className="mt-0.5 text-sm text-muted">
                  {completed} of {steps.length} complete
                </p>
              </div>
              <button
                type="button"
                onClick={props.onDismiss}
                aria-label="Close getting started"
                className="rounded-control p-2 text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-primary-action transition-[width] motion-reduce:transition-none"
                style={{ width: `${(completed / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <ol className="divide-y divide-border">
            {steps.map((step) => {
              const done = Boolean(props.state?.steps[step.id]);
              return (
                <li key={step.id} className="flex gap-3 p-4 sm:px-5">
                  <span
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border",
                      done
                        ? "border-primary bg-primary-action text-primary-foreground"
                        : "border-border-strong text-muted",
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      <span
                        className="size-1.5 rounded-full bg-current"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        "text-sm font-semibold",
                        done && "text-muted line-through",
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {step.description}
                    </p>
                    {!done && (
                      <Link
                        href={step.href}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-text hover:underline"
                      >
                        {step.action}
                        <ChevronRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <p
            className="border-t border-border bg-surface-muted px-4 py-3 text-xs leading-5 text-muted sm:px-5"
            role="status"
            aria-live="polite"
          >
            Progress updates automatically after you complete an action.
          </p>
        </aside>
      )}

      {!props.panelOpen && !props.welcomeOpen && (
        <div className="fixed bottom-24 right-3 z-30 sm:bottom-6 sm:right-6">
          {props.error ? (
            <button
              type="button"
              onClick={props.onRetry}
              className="inline-flex min-h-11 items-center gap-2 rounded-control border border-border bg-surface px-4 text-sm font-semibold shadow-lg"
              disabled={props.loading}
            >
              <RotateCcw
                className={cn(
                  "size-4",
                  props.loading && "animate-spin motion-reduce:animate-none",
                )}
                aria-hidden="true"
              />
              Retry tips
            </button>
          ) : (
            <button
              type="button"
              onClick={props.onOpen}
              className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary-action px-4 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary-hover"
              disabled={props.loading || !props.state}
            >
              {props.loading && !props.state ? (
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <CircleHelp className="size-4" aria-hidden="true" />
              )}
              {props.state
                ? allComplete
                  ? "Tips"
                  : `Getting started ${completed}/${steps.length}`
                : "Loading tips"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function WelcomeDialog({
  role,
  saving,
  onStart,
  onSkip,
}: {
  role: OnboardingRole;
  saving: boolean;
  onStart: () => void;
  onSkip: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onSkipRef = useRef(onSkip);

  useEffect(() => {
    onSkipRef.current = onSkip;
  }, [onSkip]);

  useEffect(() => {
    const returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogRef.current
      ?.querySelector<HTMLButtonElement>("[data-onboarding-start]")
      ?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkipRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href]",
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      returnFocus?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-8"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-welcome-title"
        aria-describedby="onboarding-welcome-description"
        className="w-full max-w-lg rounded-card border border-border bg-surface p-6 shadow-2xl sm:p-8"
      >
        <span className="grid size-11 place-items-center rounded-full bg-primary-soft text-primary-text">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-primary-text">
          Welcome to MarketPal
        </p>
        <h2 id="onboarding-welcome-title" className="mt-2 text-2xl font-bold">
          {role === "seller"
            ? "Let's get your shop ready"
            : "Find what you need with confidence"}
        </h2>
        <p
          id="onboarding-welcome-description"
          className="mt-3 leading-7 text-muted"
        >
          {role === "seller"
            ? "A short checklist will guide you through your shop, pickup areas and first listing."
            : "A short checklist will help you personalise your campus, save listings and contact sellers."}
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={saving}
          >
            Skip for now
          </Button>
          <Button
            data-onboarding-start
            type="button"
            onClick={onStart}
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <ArrowRight className="size-4" aria-hidden="true" />
            )}
            Show me around
          </Button>
        </div>
      </div>
    </div>
  );
}
