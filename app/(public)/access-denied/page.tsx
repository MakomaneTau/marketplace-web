import { Home, LogIn, ShieldAlert } from "lucide-react";
import Link from "next/link";

type AccessDeniedPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const { reason } = await searchParams;
  const unavailable = reason === "auth_unavailable";

  return (
    <main className="grid min-h-[65vh] place-items-center px-4 py-12">
      <section
        aria-labelledby="access-title"
        className="w-full max-w-lg rounded-card border border-border bg-surface p-6 text-center shadow-sm sm:p-8"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <ShieldAlert className="size-7" aria-hidden="true" />
        </span>
        <h1 id="access-title" className="mt-4 text-2xl font-bold text-foreground">
          {unavailable ? "Authentication is temporarily unavailable" : "A seller account is required"}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          {unavailable
            ? "We could not verify your access right now. Please try again shortly."
            : "This area is available to signed-in seller accounts. Your marketplace account and data remain unchanged."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            <LogIn className="size-4" aria-hidden="true" /> Sign in
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-control border border-border px-5 py-3 text-sm font-semibold"
          >
            <Home className="size-4" aria-hidden="true" /> Marketplace home
          </Link>
        </div>
      </section>
    </main>
  );
}
