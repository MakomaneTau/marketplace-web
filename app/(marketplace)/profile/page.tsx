import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Container } from "@/app/components/layout/Container";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your marketplace profile.",
};

const profileLinks = [
  { label: "My orders", description: "Track purchases and collection", href: "/orders", icon: Package },
  { label: "Favourites", description: "View saved marketplace products", href: "/favourites", icon: Heart },
];

export default function ProfilePage() {
  return (
    <Container className="max-w-5xl py-6 md:py-8 lg:py-10">
      <section className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="h-28 bg-primary sm:h-36" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex size-24 items-center justify-center rounded-full border-4 border-surface bg-primary-soft text-2xl font-bold text-primary sm:size-28">
                KM
              </div>
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary-soft px-2.5 py-1 text-xs font-semibold text-secondary">
                    <ShieldCheck className="size-4" /> Verified student
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <GraduationCap className="size-4" /> University of the Witwatersrand
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="size-4" /> Wits Main Campus
                </p>
              </div>
            </div>

            <button type="button" className="inline-flex h-11 items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-surface-muted">
              Edit profile
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          <div className="mt-3 divide-y divide-border">
            {profileLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 py-4 first:pt-2 hover:text-primary">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{item.description}</span>
                  </span>
                  <ChevronRight className="size-5 text-muted" />
                </Link>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Marketplace reputation</h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">4.8</span>
              <div>
                <div className="flex text-warning">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted">12 marketplace reviews</p>
              </div>
            </div>
          </section>

          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Verification</h2>
            <div className="mt-3 space-y-3 text-sm">
              <VerificationRow label="Email verified" />
              <VerificationRow label="Student status verified" />
              <VerificationRow label="Profile completed" />
            </div>
          </section>
        </aside>
      </div>
    </Container>
  );
}

function VerificationRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <CheckCircle2 className="size-4 text-secondary" />
      <span>{label}</span>
    </div>
  );
}
