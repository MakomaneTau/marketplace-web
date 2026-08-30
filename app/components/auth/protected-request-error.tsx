import { Home, LogIn, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { SESSION_ERROR_MESSAGE } from "@/app/libs/api";

export function ProtectedRequestError({ message }: { message: string }) {
  if (message !== SESSION_ERROR_MESSAGE) {
    return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>;
  }

  return (
    <section role="alert" aria-labelledby="session-expired-title" className="grid min-h-[55vh] place-items-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 id="session-expired-title" className="mt-4 text-xl font-bold text-slate-950">Your session has ended</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">Sign in again to continue managing your seller account, or return to the marketplace.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover">
            <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Home className="h-4 w-4" aria-hidden="true" /> Back to marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}
