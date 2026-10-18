"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Conversations } from "@/components/messaging/Conversations";

function MessagesContent() {
  const id = useSearchParams().get("conversation");
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <PageHeader
        icon={MessageCircle}
        title="Messages"
        description="Keep product enquiries, meetup details, and seller replies in one place."
      />
      <div className="mt-7">
        <Conversations initialId={id} />
      </div>
    </Container>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<LoadingSplash compact label="Loading messages..." />}>
      <MessagesContent />
    </Suspense>
  );
}
