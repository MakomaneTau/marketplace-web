"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { Container } from "@/app/components/layout/Container";
import { Conversations } from "@/app/components/messaging/Conversations";

function MessagesContent() {
  const id = useSearchParams().get("conversation");
  return <Container className="py-8"><h1 className="mb-5 text-2xl font-bold">Messages</h1><Conversations initialId={id}/></Container>;
}

export default function MessagesPage() {
  return <Suspense fallback={<p className="py-16 text-center text-muted">Loading messages...</p>}><MessagesContent /></Suspense>;
}
