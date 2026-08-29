import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { InformationPage } from "@/app/components/content/InformationPage";

export const metadata: Metadata = {
  title: "Report a problem",
  description: "Steps for reporting unsafe activity, suspicious listings and technical problems.",
};

const sections = [
  {
    title: "If someone may be in immediate danger",
    paragraphs: [
      "Leave the situation, move to a safe public place and contact campus security or the appropriate local emergency service. The marketplace is not an emergency-response service.",
    ],
  },
  {
    title: "Preserve useful information",
    items: [
      "Keep the listing URL, product title and seller display name.",
      "Save relevant order numbers, message dates and screenshots.",
      "Do not continue a payment or meeting merely to collect more evidence.",
      "Never send passwords, one-time codes, banking PINs or extra identity documents.",
    ],
  },
  {
    title: "What should be reported",
    items: [
      "Suspected scams, stolen goods, counterfeit products or misleading listings.",
      "Harassment, threats, hate speech or pressure to communicate outside the marketplace.",
      "Requests for unsafe payments, verification codes or unnecessary personal information.",
      "Technical failures that prevent sign-in, listing management, messaging or order access.",
    ],
  },
  {
    title: "Current reporting boundary",
    paragraphs: [
      "A direct moderation-submission endpoint has not yet been connected to this application. This page therefore does not pretend to submit a report. Use the available support paths below, stop contact when necessary and retain the details for follow-up.",
    ],
  },
];

export default function ReportPage() {
  return (
    <InformationPage
      icon={AlertTriangle}
      title="Report a problem"
      description="Respond safely to suspicious activity, harmful conduct or technical problems."
      notice="Reports should be factual and limited to information needed to understand the issue. Do not publish another person's private information."
      sections={sections}
      actions={[
        { href: "/contact", label: "View support options" },
        { href: "/safety", label: "Read safety guidance" },
        { href: "/messages", label: "Review your messages" },
      ]}
    />
  );
}
