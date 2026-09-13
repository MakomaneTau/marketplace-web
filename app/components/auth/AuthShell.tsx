import {
  ArrowLeft,
  LockKeyhole,
  MessageCircle,
  RotateCcwKey,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/app/libs/utils";

type AuthKind = "login" | "signup" | "recovery";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
  kind?: AuthKind;
  wide?: boolean;
}

const icons = {
  login: LockKeyhole,
  signup: UserPlus,
  recovery: RotateCcwKey,
};

const trustItems = [
  { icon: ShieldCheck, label: "Verified sellers", detail: "Clear account status" },
  { icon: UsersRound, label: "Safer meetups", detail: "Campus-first guidance" },
  { icon: MessageCircle, label: "Private messaging", detail: "Keep plans in the app" },
];

export function AuthShell({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerHref,
  kind = "login",
  wide = false,
}: AuthShellProps) {
  const ContextIcon = icons[kind];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <ShoppingBag className="size-6 text-primary" aria-hidden="true" />
            <span>Market<span className="text-primary">place</span></span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to marketplace</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className={cn("mx-auto w-full", wide ? "max-w-2xl" : "max-w-lg")}>
          <header className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-control bg-primary-soft text-primary">
              <ContextIcon className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-3xl font-bold text-foreground">{title}</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">{description}</p>
          </header>

          <section className="mt-7 rounded-card border border-border bg-surface p-5 sm:p-7" aria-label={`${title} form`}>
            {children}
          </section>

          <p className="mt-6 text-center text-sm text-muted">
            {footerText}{" "}
            <Link href={footerHref} className="font-semibold text-primary hover:underline">
              {footerLinkText}
            </Link>
          </p>
        </div>

        <section aria-label="Marketplace trust" className="mx-auto mt-10 grid w-full max-w-3xl gap-4 border-t border-border pt-6 sm:grid-cols-3 sm:gap-0">
          {trustItems.map(({ icon: Icon, label, detail }, index) => (
            <div key={label} className={cn("flex items-center gap-3 px-3", index > 0 && "sm:border-l sm:border-border sm:pl-6")}>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary-soft text-secondary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted">{detail}</p></div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">
          <p>Marketplace for South African students</p>
          <nav aria-label="Legal" className="flex gap-5"><Link href="/safety" className="hover:text-primary">Safety</Link><Link href="/help" className="hover:text-primary">Help</Link><Link href="/privacy" className="hover:text-primary">Privacy</Link></nav>
        </div>
      </footer>
    </div>
  );
}
