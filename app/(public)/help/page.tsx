import type { Metadata } from "next";
import Link from "next/link";
import { CircleHelp, Mail, MessageCircle, Search } from "lucide-react";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Get help using the student marketplace.",
};

const frequentlyAskedQuestions = [
  {
    question: "How do I buy a product?",
    answer:
      "Open the product page, review the listing and seller information, then message the seller to confirm availability and collection arrangements.",
  },
  {
    question: "How do I create a listing?",
    answer:
      "Choose Sell from the navigation, add the product details and clear images, select a safe pickup location, then publish the listing.",
  },
  {
    question: "Why is student verification required?",
    answer:
      "Buyer accounts are limited to students. Verification helps the marketplace confirm eligibility and improve trust between users.",
  },
  {
    question: "How do I report a suspicious listing?",
    answer:
      "Use the report option on the product or seller page. Include a clear reason so the moderation team can review it.",
  },
  {
    question: "Can a seller be a non-student?",
    answer:
      "Yes. Sellers may be students or non-students, but their account type and verification status should be shown clearly to buyers.",
  },
];

export default function HelpPage() {
  return (
    <Container className="max-w-5xl py-6 md:py-8 lg:py-10">
      <PageHeader
        icon={CircleHelp}
        title="How can we help?"
        description="Find answers about accounts, listings, buying, selling and marketplace safety."
      />

      <section className="mt-8 rounded-card bg-primary p-5 text-white sm:p-8">
        <label className="relative block max-w-2xl">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search help topics"
            className="h-12 w-full rounded-control bg-white pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted"
          />
        </label>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-foreground">Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-border rounded-card border border-border bg-surface px-5 sm:px-6">
          {frequentlyAskedQuestions.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-foreground marker:hidden sm:text-base">
                {item.question}
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <SupportCard
          icon={MessageCircle}
          title="Marketplace messages"
          description="Contact a seller from the product page when your question is about a listing."
          href="/messages"
          linkText="Open messages"
        />
        <SupportCard
          icon={Mail}
          title="Contact support"
          description="Report an account, technical problem or issue that you cannot resolve through the help centre."
          href="/safety"
          linkText="View safety support"
        />
      </section>
    </Container>
  );
}

interface SupportCardProps {
  icon: typeof Mail;
  title: string;
  description: string;
  href: string;
  linkText: string;
}

function SupportCard({ icon: Icon, title, description, href, linkText }: SupportCardProps) {
  return (
    <article className="rounded-card border border-border bg-surface p-5">
      <span className="flex size-11 items-center justify-center rounded-card bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <Link href={href} className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
        {linkText}
      </Link>
    </article>
  );
}
