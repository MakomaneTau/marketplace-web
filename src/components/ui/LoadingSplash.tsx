import { LoaderCircle } from "lucide-react";

type LoadingSplashProps = {
  label?: string;
  compact?: boolean;
};

/** A labelled loading state for both server and client components. */
export function LoadingSplash({
  label = "Loading marketplace…",
  compact = false,
}: LoadingSplashProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={
        compact
          ? "flex items-center justify-center gap-3 px-4 py-6 text-sm text-muted"
          : "flex min-h-[45vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center"
      }
    >
      {!compact && (
        <span
          aria-hidden="true"
          className="grid size-14 place-items-center rounded-card bg-primary-soft text-2xl font-black text-primary-text"
        >
          M
        </span>
      )}
      <LoaderCircle
        aria-hidden="true"
        className="size-6 shrink-0 animate-spin text-primary-text motion-reduce:animate-none"
      />
      <p className="font-medium">{label}</p>
      {!compact && <p className="text-sm text-muted">Please wait a moment.</p>}
    </div>
  );
}
