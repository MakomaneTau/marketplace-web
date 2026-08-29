import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { InformationPage } from "@/app/components/content/InformationPage";

export const metadata: Metadata = {
  title: "Contact and support",
  description: "Find the appropriate support path for marketplace questions and problems.",
};

const sections = [
  {
    title: "Questions about a product",
    paragraphs: [
      "Use the Message seller action on the product page. Keep availability, condition, delivery and collection discussions in marketplace messages where possible.",
    ],
  },
  {
    title: "Account access",
    paragraphs: [
      "Use Forgot password on the sign-in page when you cannot access your account. Profile details can be reviewed after sign-in. Never send anyone your password or recovery code.",
    ],
  },
  {
    title: "Safety or conduct concerns",
    paragraphs: [
      "Visit Report a problem for the information to preserve and the safest next steps. For immediate real-world danger, contact campus security or the appropriate local emergency service.",
    ],
  },
  {
    title: "Technical support",
    items: [
      "Record the page address and the action you were attempting.",
      "Include the visible error message and approximate time it occurred.",
      "Do not include access tokens, passwords, identity images or full banking information.",
      "A public support email and direct support form have not yet been configured, so this page only links to support paths that currently work.",
    ],
  },
];

export default function ContactPage() {
  return (
    <InformationPage
      icon={Mail}
      title="Contact and support"
      description="Choose the support path that matches your question without sharing unnecessary personal information."
      sections={sections}
      actions={[
        { href: "/help", label: "Open help centre" },
        { href: "/report", label: "Report a problem" },
        { href: "/forgot-password", label: "Recover account" },
      ]}
    />
  );
}
