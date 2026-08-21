"use client";

import { useSearchParams } from "next/navigation";

import { Container } from "@/app/components/layout/Container";
import { Conversations } from "@/app/components/messaging/Conversations";

export default function MessagesPage() {
  const id = useSearchParams().get("conversation");
  return <Container className="py-8"><h1 className="mb-5 text-2xl font-bold">Messages</h1><Conversations initialId={id}/></Container>;
}
