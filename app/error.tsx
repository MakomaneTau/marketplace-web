"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("A marketplace route failed to render.", error);
  }, [error]);

  return (
    <main className="grid min-h-[55vh] place-items-center px-4 py-12">
      <section role="alert" className="w-full max-w-lg rounded-card border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">This page could not be loaded</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          The problem may be temporary. Try loading the page again or return to the marketplace.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="rounded-control bg-primary px-5 py-3 font-semibold text-white">
            Try again
          </button>
          <Link href="/" className="rounded-control border border-border px-5 py-3 font-semibold">
            Marketplace home
          </Link>
        </div>
      </section>
    </main>
  );
}
