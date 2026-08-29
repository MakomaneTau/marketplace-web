import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { InformationPage } from "@/app/components/content/InformationPage";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms governing use of the student marketplace.",
};

const sections = [
  {
    title: "Using the marketplace",
    paragraphs: [
      "You must provide accurate account information, protect your sign-in details and use the marketplace only for lawful purposes. You are responsible for activity performed through your account unless you report unauthorised access promptly.",
    ],
  },
  {
    title: "Listings and seller responsibilities",
    items: [
      "Sellers must have the right to sell each listed product.",
      "Descriptions, images, prices, stock and condition must be materially accurate.",
      "Sellers must not list prohibited products or use misleading, copied or unlawful content.",
      "Verification status does not guarantee a product, person or transaction.",
    ],
  },
  {
    title: "Transactions between users",
    paragraphs: [
      "Buyers and sellers are responsible for deciding whether to transact, checking product condition and agreeing on payment, delivery or campus collection. Unless a separate managed-payment service is introduced, the marketplace provides communication and order tools but is not the buyer, seller, payment processor or delivery provider.",
    ],
  },
  {
    title: "Acceptable conduct",
    paragraphs: [
      "You must follow the Community guidelines. Fraud, harassment, impersonation, attempts to obtain sensitive credentials, interference with the service and unlawful use are prohibited.",
    ],
  },
  {
    title: "Availability and responsibility",
    paragraphs: [
      "The service may change, experience interruptions or contain errors. Product information is supplied by users. To the extent permitted by applicable law, the marketplace does not promise that every listing, user, transaction or external service is accurate, available or risk-free.",
    ],
  },
  {
    title: "Restrictions and changes",
    paragraphs: [
      "Access may be restricted when an account or listing creates legal, fraud, security or safety risks. These terms should be updated when payment handling, delivery services, moderation, account deletion, business ownership or production support channels are introduced.",
    ],
  },
];

export default function TermsPage() {
  return (
    <InformationPage
      icon={FileText}
      title="Terms of service"
      description="The responsibilities that apply when using the marketplace to buy, sell or communicate."
      notice="Effective date: 29 August 2026. These terms are a practical implementation draft and require legal review before a public production launch."
      sections={sections}
      actions={[
        { href: "/guidelines", label: "Read community guidelines" },
        { href: "/privacy", label: "Read privacy policy" },
      ]}
    />
  );
}
