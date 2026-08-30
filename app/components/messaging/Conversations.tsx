"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { apiErrorMessage, apiRequest, getStoredAuth, SESSION_ERROR_MESSAGE } from "@/app/libs/api";

type Message = { id: string; sender_id: string; body: string; created_at: string };
type Conversation = { id: string; product: { title: string }; buyer: { display_name: string }; seller: { display_name: string }; latest_message: Message | null; unread_count: number; messages?: Message[] };

export function Conversations({ initialId }: { initialId?: string | null }) {
  const [items, setItems] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userId = getStoredAuth()?.user.id;

  const open = useCallback(async (id: string) => {
    try {
      const conversation = await apiRequest<Conversation>(`/conversations/${id}`, { auth: true });
      setActive(conversation);
      await apiRequest(`/conversations/${id}/read`, { method: "PATCH", auth: true });
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
  }, []);

  useEffect(() => {
    apiRequest<Conversation[]>("/conversations", { auth: true }).then((conversations) => {
      setItems(conversations);
      const id = initialId || conversations[0]?.id;
      if (id) open(id);
    }).catch((requestError) => setError(apiErrorMessage(requestError)));
  }, [initialId, open]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await apiRequest(`/conversations/${active.id}/messages`, { method: "POST", auth: true, body: JSON.stringify({ body: data.get("body") }) });
      form.reset();
      await open(active.id);
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
  }

  if (error === SESSION_ERROR_MESSAGE) return <ProtectedRequestError message={error} />;

  return <section className="grid min-h-[36rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[320px_1fr]"><aside className="divide-y border-r border-slate-200">{items.map((item) => <button key={item.id} onClick={() => open(item.id)} className={`block w-full p-4 text-left ${active?.id === item.id ? "bg-violet-50" : "hover:bg-slate-50"}`}><p className="font-semibold">{item.product.title}</p><p className="truncate text-xs text-slate-500">{item.latest_message?.body || "No messages yet"}</p>{item.unread_count > 0 && <span className="mt-1 inline-block rounded-full bg-violet-700 px-2 text-xs text-white">{item.unread_count}</span>}</button>)}</aside><div className="flex flex-col"><div className="border-b p-4 font-semibold">{active ? `${active.buyer.display_name} · ${active.product.title}` : "Select a conversation"}</div><div className="flex-1 space-y-3 bg-slate-50 p-5">{active?.messages?.map((message) => <div key={message.id} className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"}`}><p className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === userId ? "bg-violet-700 text-white" : "bg-white"}`}>{message.body}</p></div>)}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}</div><form onSubmit={send} className="flex gap-2 border-t p-4"><input name="body" required maxLength={2000} placeholder="Write a message" className="flex-1 rounded-xl border px-4 py-3"/><button aria-label="Send message" className="rounded-xl bg-violet-700 p-3 text-white"><Send className="h-5 w-5"/></button></form></div></section>;
}
