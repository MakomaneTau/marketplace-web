"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCheck, GraduationCap, MessageCircle, Package, Search, Send } from "lucide-react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { notifyMessagesChanged } from "@/app/components/messaging/unread-messages";
import { useAuth } from "@/app/hooks/use-auth";
import { apiErrorMessage, apiRequest, SESSION_ERROR_MESSAGE } from "@/app/libs/api";

type Message = { id: string; sender_id: string; body: string; created_at: string; read_at: string | null };
type Person = { id: string; display_name: string; university: { name: string; acronym: string } | null };
type Conversation = {
  id: string; product: { title: string; slug: string; price: number | string; image_urls: string[] } | null;
  buyer: Person; seller: Person; latest_message: Message | null; unread_count: number; messages?: Message[];
};
const time = (date: string) => new Date(date).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
const day = (date: string) => new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

export function Conversations({ initialId }: { initialId?: string | null }) {
  const { auth, ready } = useAuth();
  const userId = auth?.user.id;
  const [items, setItems] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialId || null);
  const [active, setActive] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [revision, setRevision] = useState(0);
  const scrollArea = useRef<HTMLDivElement>(null);
  const current = active?.id === activeId ? active : null;
  const contact = (item: Conversation) => item.buyer.id === userId ? item.seller : item.buyer;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let loading = false;
    const refresh = async () => {
      if (loading || document.visibilityState !== "visible") return;
      loading = true;
      try {
        const [list, conversation] = await Promise.all([
          apiRequest<Conversation[]>("/conversations", { auth: true }),
          activeId ? apiRequest<Conversation>(`/conversations/${activeId}`, { auth: true }) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setItems(list);
        setLoaded(true);
        setError(null);
        if (!activeId && list.length) setActiveId(list[0].id);
        if (conversation) setActive(conversation);
      } catch (e: unknown) {
        if (!cancelled) { setError(apiErrorMessage(e)); setLoaded(true); }
      } finally { loading = false; }
    };
    void refresh();
    const timer = window.setInterval(refresh, 5000);
    document.addEventListener("visibilitychange", refresh);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [activeId, userId, revision]);

  useEffect(() => {
    if (!current || document.visibilityState !== "visible") return;
    const ids = (current.messages || []).filter((message) => message.sender_id !== userId && !message.read_at).map((message) => message.id);
    if (!ids.length) return;
    let cancelled = false;
    apiRequest(`/conversations/${current.id}/read`, { method: "PATCH", auth: true, body: JSON.stringify({ messageIds: ids }) })
      .then(() => {
        notifyMessagesChanged();
        if (!cancelled) setItems((list) => list.map((item) => item.id === current.id ? { ...item, unread_count: Math.max(0, item.unread_count - ids.length) } : item));
      }).catch((e: unknown) => { if (!cancelled) setError(apiErrorMessage(e)); });
    return () => { cancelled = true; };
  }, [current, userId]);

  useEffect(() => {
    if (scrollArea.current) scrollArea.current.scrollTop = scrollArea.current.scrollHeight;
  }, [activeId, current?.messages?.length]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await apiRequest(`/conversations/${current.id}/messages`, { method: "POST", auth: true, body: JSON.stringify({ body: draft.trim() }) });
      setDraft("");
      setRevision((value) => value + 1);
      notifyMessagesChanged();
    } catch (e: unknown) { setError(apiErrorMessage(e)); }
    finally { setSending(false); }
  }

  if (ready && !auth || error === SESSION_ERROR_MESSAGE) return <ProtectedRequestError message={SESSION_ERROR_MESSAGE} />;
  const filtered = items.filter((item) => `${contact(item).display_name} ${contact(item).university?.name || ""} ${item.product?.title || ""}`.toLowerCase().includes(search.toLowerCase()));
  const person = current ? contact(current) : null;
  return (
    <section className="grid min-h-[38rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="min-w-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="flex items-center justify-between"><h2 className="font-bold">Inbox</h2><span className="text-xs text-slate-500">{items.length} conversations</span></div>
          <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5"><Search className="size-4 text-slate-400" /><input aria-label="Search conversations" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, university or product" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
        </div>
        <div className="max-h-72 overflow-y-auto lg:max-h-[36rem]">
          {filtered.map((item) => {
            const person = contact(item);
            return <button type="button" key={item.id} disabled={sending} onClick={() => { setActiveId(item.id); setDraft(""); }} aria-pressed={activeId === item.id} className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition ${activeId === item.id ? "border-l-4 border-l-violet-600 bg-violet-50" : "border-l-4 border-l-transparent hover:bg-slate-50"}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-800">{initials(person.display_name)}</span>
              <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold">{person.display_name}</span>{item.unread_count > 0 && <span aria-label={`${item.unread_count} unread messages`} className="rounded-full bg-violet-700 px-2 py-0.5 text-[10px] font-bold text-white">{item.unread_count}</span>}</span>
                <span className="flex items-center gap-1 text-xs text-slate-500"><GraduationCap className="size-3.5 shrink-0" /><span className="truncate">{person.university?.name || "University not provided"}</span></span>
                <span className="block truncate text-xs font-medium text-violet-700">{item.product?.title || "Product no longer available"}</span>
                <span className="block truncate text-xs text-slate-500">{item.latest_message?.sender_id === userId && "You: "}{item.latest_message?.body || "Start the conversation"}</span>
                {item.latest_message && <span className="block text-[10px] text-slate-400">{day(item.latest_message.created_at)} ? {time(item.latest_message.created_at)}</span>}
              </span>
            </button>;
          })}
          {!filtered.length && <p className="p-6 text-sm text-slate-500">{!loaded ? "Loading conversations..." : items.length ? "No conversations match your search." : "No conversations yet. Product enquiries will appear here."}</p>}
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        {current && person ? <>
          <header className="flex items-center gap-3 border-b border-slate-100 p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-violet-100 font-bold text-violet-800">{initials(person.display_name)}</span>
            <div><h2 className="font-bold">{person.display_name}</h2><p className="mt-0.5 text-xs text-slate-500">{person.university?.name || "University not provided"}</p></div>
          </header>
          {current.product && <Link href={`/products/${current.product.slug}`} className="m-4 flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3 hover:bg-violet-50">
            <Package className="size-8 shrink-0 text-violet-500" /><span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wider text-violet-600">Enquiring about</span><span className="block truncate text-sm font-semibold">{current.product.title}</span><span className="text-xs text-slate-500">R{Number(current.product.price).toFixed(2)} ? View product</span></span>
          </Link>}
          <div ref={scrollArea} role="log" aria-label="Conversation messages" aria-live="polite" className="h-[25rem] space-y-4 overflow-y-auto bg-slate-50/80 px-4 py-5 sm:px-6">
            {current.messages?.map((message, index, messages) => {
              const own = message.sender_id === userId;
              const showDay = index === 0 || day(messages[index - 1].created_at) !== day(message.created_at);
              return <div key={message.id}>
                {showDay && <p className="mb-5 text-center text-[11px] font-medium text-slate-400">{day(message.created_at)}</p>}
                <div className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${own ? "rounded-br-sm bg-violet-700 text-white" : "rounded-bl-sm border border-slate-100 bg-white text-slate-800"}`}>
                  {!own && <p className="mb-1 text-[10px] font-semibold text-violet-600">{person.display_name}</p>}
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{message.body}</p>
                  <p className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${own ? "text-violet-100" : "text-slate-400"}`}><time dateTime={message.created_at}>{time(message.created_at)}</time>{own && <span title={message.read_at ? `Seen ${day(message.read_at)} at ${time(message.read_at)}` : "Sent; not yet read"} className="ml-1 inline-flex items-center gap-1">{message.read_at ? <CheckCheck className="size-3.5" /> : <Check className="size-3.5" />}{message.read_at ? "Seen" : "Sent"}</span>}</p>
                </div></div>
              </div>;
            })}
            {!current.messages?.length && <p className="py-16 text-center text-sm text-slate-500">Say hello and ask about this product.</p>}
          </div>
        </> : <div className="grid flex-1 place-items-center p-12 text-center text-slate-500"><div><MessageCircle className="mx-auto mb-4 size-12 text-violet-300" /><h2 className="font-semibold text-slate-800">{activeId && !error ? "Loading conversation..." : "Your conversations, all in one place"}</h2><p className="mt-2 text-sm">Choose an enquiry to see the product and chat history.</p></div></div>}
        {error && <div role="alert" className="px-5 py-3 text-sm text-red-700">{error} <button type="button" onClick={() => setRevision((n) => n + 1)} className="underline">Retry</button></div>}
        <form onSubmit={send} className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-end gap-2"><textarea aria-label="Message" value={draft} onChange={(e) => setDraft(e.target.value)} disabled={!current || sending} required maxLength={2000} rows={2} placeholder="Write a message?" className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none" /><button type="submit" disabled={!current || !draft.trim() || sending} aria-label={sending ? "Sending message" : "Send message"} className="rounded-xl bg-violet-700 p-3 text-white hover:bg-violet-800 disabled:opacity-40"><Send className="size-5" /></button></div>
          <p className="mt-2 text-[10px] text-slate-400">Seen means the recipient has opened your message.</p>
        </form>
      </div>
    </section>
  );
}
