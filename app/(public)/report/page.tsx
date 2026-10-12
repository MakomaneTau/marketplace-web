import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { InformationPage } from "@/components/content/InformationPage";
import { ReportForm } from "@/components/safety/report-form";

export const metadata: Metadata = {
  title: "Report a problem",
  description: "Report unsafe activity and suspicious listings.",
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
      "For technical failures, use the contact and support options below.",
    ],
  },
];

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await searchParams;
  const productId =
    product &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      product,
    )
      ? product
      : undefined;
  return (
    <>
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
      <div className="mx-auto w-full max-w-4xl px-4 pb-12 md:px-6">
        <ReportForm productId={productId} />
      </div>
    </>
  );
}
