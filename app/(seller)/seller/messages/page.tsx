import { Conversations } from "@/app/components/messaging/Conversations";
import { SectionHeading } from "@/app/components/seller/section-heading";

export default function SellerMessagesPage() {
  return <div className="space-y-6"><SectionHeading eyebrow="Buyer communication" title="Messages" description="Answer product questions and agree on safe collection or delivery details."/><Conversations/></div>;
}
