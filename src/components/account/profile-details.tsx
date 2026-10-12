import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/Container";

export function ProfileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon
        className="mt-0.5 size-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase text-muted">{label}</dt>
        <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}

export function OverviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 py-3 first:pt-1 last:pb-0">
      <Icon className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden="true" />
      <div>
        <dt className="text-sm font-semibold">{label}</dt>
        <dd className="mt-0.5 text-sm text-muted">{value}</dd>
      </div>
    </div>
  );
}

export function AccountLink({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
    >
      <Icon
        className="size-5 shrink-0 text-muted group-hover:text-primary"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-muted">{description}</span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-subtle"
        aria-hidden="true"
      />
    </Link>
  );
}

export function ProfileSkeleton() {
  return (
    <Container
      className="max-w-7xl py-10"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="h-4 w-36 animate-pulse rounded bg-border motion-reduce:animate-none" />
      <div className="mt-5 h-9 w-48 animate-pulse rounded bg-border motion-reduce:animate-none" />
      <div className="mt-3 h-5 max-w-xl animate-pulse rounded bg-border motion-reduce:animate-none" />
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-96 animate-pulse rounded-card border border-border bg-surface-muted motion-reduce:animate-none" />
        <div className="h-80 animate-pulse rounded-card border border-border bg-surface-muted motion-reduce:animate-none" />
      </div>
    </Container>
  );
}
