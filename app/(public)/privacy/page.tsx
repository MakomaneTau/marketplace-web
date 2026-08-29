import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { InformationPage } from "@/app/components/content/InformationPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How the marketplace handles account, listing and transaction information.",
};

const sections = [
  {
    title: "Information the marketplace handles",
    items: [
      "Account information such as email address, role and authentication identifiers.",
      "Profile details such as display name, phone number, university, campus and verification status.",
      "Listings, product images, shops, favourites, orders, messages, reviews and notification preferences.",
      "Seller verification images submitted through the private verification flow.",
      "Technical information needed to operate and troubleshoot requests, including request identifiers and error records.",
    ],
  },
  {
    title: "How information is used",
    items: [
      "To authenticate accounts and provide buyer and seller features.",
      "To display listings, shops, reviews and the profile information needed for marketplace interactions.",
      "To process favourites, orders, conversations, notifications and seller verification.",
      "To protect the service, investigate failures and improve reliability.",
    ],
  },
  {
    title: "Visibility and sharing",
    paragraphs: [
      "Public listings and shop pages expose marketplace information such as product details, shop name, ratings and reviews. Orders and conversations are limited to participating accounts through authenticated API checks. Seller verification files are stored through a private verification flow and are not included in public API responses.",
      "The application relies on infrastructure providers, including Supabase for database, authentication and storage services, and may rely on a hosting provider when deployed.",
    ],
  },
  {
    title: "Sessions on your device",
    paragraphs: [
      "The web application stores the signed-in session in local storage when Remember me is selected, or session storage otherwise. Signing out removes the stored session. Avoid signing in on devices you do not control.",
    ],
  },
  {
    title: "Retention, correction and deletion",
    paragraphs: [
      "Information is retained while needed to operate marketplace features, preserve transaction records, address safety concerns or meet applicable obligations. Some profile fields can be corrected in the application. Automated account deletion and a public privacy-request channel have not yet been added, so this policy does not claim those tools are currently available.",
    ],
  },
  {
    title: "Security and policy changes",
    paragraphs: [
      "Reasonable access controls and private storage boundaries reduce risk, but no online service can promise absolute security. This policy should be reviewed and updated when deployment providers, support channels, retention rules or account-deletion tools change.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <InformationPage
      icon={ShieldCheck}
      title="Privacy policy"
      description="A plain-language summary of the information used to operate the marketplace."
      notice="Effective date: 29 August 2026. This policy describes the current application implementation and should be legally reviewed before a public production launch."
      sections={sections}
      actions={[
        { href: "/contact", label: "View contact options" },
        { href: "/safety", label: "Read safety guidance" },
      ]}
    />
  );
}
