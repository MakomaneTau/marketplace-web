import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { InformationPage } from "@/app/components/content/InformationPage";

export const metadata: Metadata = {
  title: "Community guidelines",
  description: "Rules for respectful and safe participation in the student marketplace.",
};

const sections = [
  {
    title: "Be accurate and honest",
    items: [
      "Use current photos and describe defects, missing parts and product condition clearly.",
      "Set a genuine price and do not create false urgency, ratings or availability claims.",
      "List only products you own or are authorised to sell.",
    ],
  },
  {
    title: "Treat people respectfully",
    items: [
      "Do not harass, threaten, discriminate against or impersonate another person.",
      "Keep messages relevant to the listing, order or collection arrangement.",
      "Respect a person's decision to end a conversation or transaction.",
    ],
  },
  {
    title: "Prohibited listings",
    items: [
      "Illegal, stolen, counterfeit or recalled goods.",
      "Weapons, controlled substances or other regulated products that cannot lawfully be sold.",
      "Passwords, accounts, identity records or another person's private information.",
      "Materials intended to enable plagiarism, cheating or other academic misconduct.",
      "Listings designed mainly to redirect users to scams or unrelated external services.",
    ],
  },
  {
    title: "Safe transactions",
    items: [
      "Use public campus collection points where possible and inspect products before completing payment.",
      "Do not request passwords, one-time codes, banking PINs or unnecessary identity documents.",
      "Do not pressure another user into a payment method or meeting arrangement they consider unsafe.",
    ],
  },
  {
    title: "Enforcement",
    paragraphs: [
      "Listings or accounts that create safety, fraud or legal risks may be restricted or removed when moderation capabilities are available. Serious conduct may also be referred to the relevant institution or lawful authority where appropriate.",
    ],
  },
];

export default function GuidelinesPage() {
  return (
    <InformationPage
      icon={ShieldCheck}
      title="Community guidelines"
      description="Shared rules for honest listings, respectful communication and safer transactions."
      sections={sections}
      actions={[
        { href: "/report", label: "Report a concern" },
        { href: "/safety", label: "Review safety guidance" },
      ]}
    />
  );
}
