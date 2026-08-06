import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Marketplace safety",
  description: "Safety guidance for buying and selling through the marketplace.",
};

const safetyTips = [
  {
    icon: MapPin,
    title: "Meet in a public place",
    description: "Use a busy campus location during daylight hours. Avoid isolated collection points.",
  },
  {
    icon: BadgeCheck,
    title: "Check the account",
    description: "Review verification status, ratings, account history and the seller profile before meeting.",
  },
  {
    icon: Smartphone,
    title: "Inspect before paying",
    description: "Test electronics and confirm the product matches the listing before completing payment.",
  },
  {
    icon: MessageCircle,
    title: "Keep useful records",
    description: "Keep important product and collection discussions in marketplace messages where possible.",
  },
  {
    icon: Ban,
    title: "Do not share sensitive information",
    description: "Never share passwords, verification codes, banking PINs or unnecessary identity information.",
  },
  {
    icon: AlertTriangle,
    title: "Leave when something feels wrong",
    description: "Do not continue with a transaction when the product, person or meeting arrangement appears unsafe.",
  },
];

export default function SafetyPage() {
  return (
    <Container className="max-w-5xl py-6 md:py-8 lg:py-10">
      <PageHeader
        icon={ShieldCheck}
        title="Marketplace safety"
        description="Simple precautions can reduce risk when buying, selling and arranging campus collections."
      />

      <section className="mt-8 rounded-card border border-warning/30 bg-amber-50 p-5 sm:p-6">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="font-semibold text-foreground">Trust your judgement</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              A low price or urgent message should never pressure you into an unsafe meeting or payment.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {safetyTips.map((tip) => {
          const Icon = tip.icon;
          return (
            <article key={tip.title} className="rounded-card border border-border bg-surface p-5">
              <span className="flex size-11 items-center justify-center rounded-card bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-foreground">{tip.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{tip.description}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-card bg-primary p-6 text-white sm:p-8">
        <h2 className="text-xl font-bold">Report suspicious activity</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
          Save relevant details, stop communicating when necessary, and report the listing or account for review.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/help" className="rounded-control bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/90">
            Visit help centre
          </Link>
          <Link href="/messages" className="rounded-control border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
            Open messages
          </Link>
        </div>
      </section>
    </Container>
  );
}
