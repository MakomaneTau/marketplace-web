"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Conversations } from "@/app/components/messaging/Conversations";

function MessagesContent() {
  const id = useSearchParams().get("conversation");
  return (
    <Container className="py-6 md:py-8 lg:py-10">
      <PageHeader icon={MessageCircle} title="Messages" description="Keep product enquiries, meetup details, and seller replies in one place." />
      <div className="mt-7"><Conversations initialId={id} /></div>
    </Container>
  );
}

export default function MessagesPage() {
  return <Suspense fallback={<p className="py-16 text-center text-muted">Loading messages...</p>}><MessagesContent /></Suspense>;
}
