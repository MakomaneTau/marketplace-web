import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
        <SearchX className="mx-auto size-12 text-muted" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          The page or marketplace item may have been removed or the address may be incorrect.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
          Return home
        </Link>
      </div>
    </main>
  );
}
