"use client";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  ExternalLink,
  GraduationCap,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { notifyMessagesChanged } from "@/app/components/messaging/unread-messages";
import { useAuth } from "@/app/hooks/use-auth";
import { apiErrorMessage, apiRequest, SESSION_ERROR_MESSAGE } from "@/app/libs/api";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

type Person = {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  university: { name: string; acronym: string } | null;
};

type Conversation = {
  id: string;
  product: {
    title: string;
    slug: string;
    price: number | string;
    image_urls: string[];
    status?: string;
  } | null;
  buyer: Person;
  seller: Person;
  latest_message: Message | null;
  unread_count: number;
  messages?: Message[];
};

function messageTime(value: string) {
  return new Intl.DateTimeFormat("en-ZA", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function messageDay(value: string) {
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
}

function Avatar({ person, size = "md" }: { person: Person; size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "size-10" : "size-11";
  if (person.avatar_url) {
    return <Image src={person.avatar_url} alt="" width={44} height={44} className={`${dimensions} shrink-0 rounded-full object-cover`} />;
  }
  return <span className={`grid ${dimensions} shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary`}>{initials(person.display_name)}</span>;
}

function MessagingSkeleton() {
  return (
    <div className="grid min-h-[40rem] overflow-hidden rounded-card border border-border bg-surface lg:grid-cols-[21rem_minmax(0,1fr)]">
      <div className="border-r border-border p-4"><div className="h-10 animate-pulse rounded-control bg-surface-muted" /><div className="mt-5 space-y-4">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-control bg-surface-muted" />)}</div></div>
      <div className="hidden p-6 lg:block"><div className="h-full animate-pulse rounded-control bg-surface-muted" /></div>
    </div>
  );
}

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
  const [mobileThreadOpen, setMobileThreadOpen] = useState(Boolean(initialId));
  const scrollArea = useRef<HTMLDivElement>(null);

  const current = active?.id === activeId ? active : null;
  const contact = (conversation: Conversation) => conversation.buyer.id === userId ? conversation.seller : conversation.buyer;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let inFlight = false;

    async function refresh() {
      if (inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      const [listResult, threadResult] = await Promise.allSettled([
        apiRequest<Conversation[]>("/conversations", { auth: true }),
        activeId ? apiRequest<Conversation>(`/conversations/${activeId}`, { auth: true }) : Promise.resolve(null),
      ]);
      inFlight = false;
      if (cancelled) return;

      let requestError: string | null = null;
      if (listResult.status === "fulfilled") {
        setItems(listResult.value);
        if (!activeId && listResult.value.length) setActiveId(listResult.value[0].id);
      } else {
        requestError = apiErrorMessage(listResult.reason);
      }
      if (threadResult.status === "fulfilled") {
        if (threadResult.value) setActive(threadResult.value);
      } else {
        requestError ??= apiErrorMessage(threadResult.reason);
      }
      setError(requestError);
      setLoaded(true);
    }

    void refresh();
    const timer = window.setInterval(refresh, 5000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [activeId, userId]);

  const unreadMessageIds = useMemo(() => (
    (current?.messages ?? []).filter((message) => message.sender_id !== userId && !message.read_at).map((message) => message.id)
  ), [current?.messages, userId]);
  const unreadKey = unreadMessageIds.join(",");

  useEffect(() => {
    if (!current || !unreadKey || document.visibilityState !== "visible") return;
    let cancelled = false;
    const readAt = new Date().toISOString();
    void apiRequest(`/conversations/${current.id}/read`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ messageIds: unreadMessageIds }),
    }).then(() => {
      if (cancelled) return;
      setActive((conversation) => conversation?.id === current.id ? {
        ...conversation,
        messages: conversation.messages?.map((message) => unreadMessageIds.includes(message.id) ? { ...message, read_at: readAt } : message),
      } : conversation);
      setItems((list) => list.map((item) => item.id === current.id ? { ...item, unread_count: 0 } : item));
      notifyMessagesChanged();
    }).catch((requestError: unknown) => {
      if (!cancelled) setError(apiErrorMessage(requestError));
    });
    return () => { cancelled = true; };
  }, [current, unreadKey, unreadMessageIds]);

  useEffect(() => {
    if (scrollArea.current) scrollArea.current.scrollTop = scrollArea.current.scrollHeight;
  }, [activeId, current?.messages?.length]);

  function selectConversation(id: string) {
    if (id !== activeId) setActive(null);
    setActiveId(id);
    setDraft("");
    setError(null);
    setMobileThreadOpen(true);
    window.history.replaceState(null, "", `/messages?conversation=${encodeURIComponent(id)}`);
  }

  function showInbox() {
    setMobileThreadOpen(false);
    window.history.replaceState(null, "", "/messages");
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!current || !body || sending) return;
    setSending(true);
    setError(null);
    try {
      const message = await apiRequest<Message>(`/conversations/${current.id}/messages`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ body }),
      });
      setDraft("");
      setActive((conversation) => conversation?.id === current.id ? {
        ...conversation,
        latest_message: message,
        messages: [...(conversation.messages ?? []), message],
      } : conversation);
      setItems((list) => list.map((item) => item.id === current.id ? { ...item, latest_message: message } : item));
      notifyMessagesChanged();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  }

  if (!ready || (auth && !loaded)) return <MessagingSkeleton />;
  if (!auth || error === SESSION_ERROR_MESSAGE) return <ProtectedRequestError message={SESSION_ERROR_MESSAGE} />;

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const person = contact(item);
    return `${person.display_name} ${person.university?.name || ""} ${item.product?.title || ""}`.toLowerCase().includes(normalizedSearch);
  });
  const person = current ? contact(current) : null;
  const unreadTotal = items.reduce((total, item) => total + item.unread_count, 0);

  return (
    <section className="grid min-h-[40rem] overflow-hidden rounded-card border border-border bg-surface lg:h-[calc(100vh-12rem)] lg:max-h-[46rem] lg:grid-cols-[21rem_minmax(0,1fr)]" aria-label="Messages workspace">
      <aside className={`${mobileThreadOpen ? "hidden lg:flex" : "flex"} min-w-0 flex-col border-border lg:border-r`}>
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Inbox</h2>
            <span className="text-xs text-muted">{unreadTotal ? `${unreadTotal} unread` : `${items.length} conversations`}</span>
          </div>
          <label className="flex h-11 items-center gap-2 rounded-control border border-border bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <input aria-label="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, university or product" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle" />
          </label>
        </div>

        <div className="max-h-[34rem] flex-1 overflow-y-auto lg:max-h-none">
          {filtered.map((item) => {
            const otherPerson = contact(item);
            const selected = activeId === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => selectConversation(item.id)}
                aria-pressed={selected}
                className={`flex w-full gap-3 border-b border-border border-l-[3px] p-4 text-left transition ${selected ? "border-l-primary bg-primary-soft" : "border-l-transparent hover:bg-surface-muted"}`}
              >
                <Avatar person={otherPerson} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{otherPerson.display_name}</span>
                    {item.latest_message && <time dateTime={item.latest_message.created_at} className="shrink-0 text-[10px] text-muted">{messageTime(item.latest_message.created_at)}</time>}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted"><GraduationCap className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{otherPerson.university?.acronym || otherPerson.university?.name || "University not provided"}</span></span>
                  <span className="mt-1 block truncate text-xs font-medium text-primary">{item.product?.title || "Product no longer available"}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <span className="min-w-0 flex-1 truncate">{item.latest_message?.sender_id === userId ? "You: " : ""}{item.latest_message?.body || "Start the conversation"}</span>
                    {item.unread_count > 0 && <span aria-label={`${item.unread_count} unread messages`} className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">{item.unread_count > 99 ? "99+" : item.unread_count}</span>}
                  </span>
                </span>
              </button>
            );
          })}
          {!filtered.length && (
            <div className="px-6 py-12 text-center">
              <MessageCircle className="mx-auto size-8 text-subtle" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium">{items.length ? "No matching conversations" : "No conversations yet"}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{items.length ? "Try a different name, university, or product." : "Product enquiries will appear here."}</p>
            </div>
          )}
        </div>
      </aside>

      <div className={`${mobileThreadOpen ? "flex" : "hidden lg:flex"} min-w-0 flex-col`}>
        {current && person ? (
          <>
            <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
              <button type="button" onClick={showInbox} aria-label="Back to inbox" title="Back to inbox" className="grid size-10 shrink-0 place-items-center rounded-control text-foreground hover:bg-surface-muted lg:hidden">
                <ArrowLeft className="size-5" aria-hidden="true" />
              </button>
              <Avatar person={person} />
              <div className="min-w-0"><h2 className="truncate font-bold">{person.display_name}</h2><p className="mt-0.5 truncate text-xs text-muted">{person.university?.name || "University not provided"}</p></div>
            </header>

            {current.product && (
              <Link href={`/products/${current.product.slug}`} className="flex items-center gap-3 border-b border-border px-4 py-3 transition hover:bg-surface-muted sm:px-5">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-control bg-surface-muted">
                  <Image src={current.product.image_urls?.[0] || "/images/product-placeholder.svg"} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{current.product.title}</span><span className="mt-1 flex items-center gap-2 text-xs text-muted"><strong className="text-foreground">R{Number(current.product.price).toFixed(2)}</strong><span aria-hidden="true">/</span><span className="capitalize">{current.product.status || "View listing"}</span></span></span>
                <ExternalLink className="size-4 shrink-0 text-primary" aria-hidden="true" />
              </Link>
            )}

            <div ref={scrollArea} role="log" aria-label="Conversation messages" aria-live="polite" className="min-h-[24rem] flex-1 space-y-4 overflow-y-auto bg-background px-4 py-5 sm:px-6">
              {current.messages?.map((message, index, messages) => {
                const own = message.sender_id === userId;
                const showDay = index === 0 || messageDay(messages[index - 1].created_at) !== messageDay(message.created_at);
                return (
                  <div key={message.id}>
                    {showDay && <div className="mb-5 flex items-center gap-3"><span className="h-px flex-1 bg-border" /><time dateTime={message.created_at} className="text-[11px] font-medium text-muted">{messageDay(message.created_at)}</time><span className="h-px flex-1 bg-border" /></div>}
                    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-card px-4 py-2.5 ${own ? "bg-primary text-white" : "border border-border bg-surface text-foreground"}`}>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]">{message.body}</p>
                        <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${own ? "text-blue-100" : "text-muted"}`}>
                          <time dateTime={message.created_at}>{messageTime(message.created_at)}</time>
                          {own && <span title={message.read_at ? `Seen ${messageDay(message.read_at)} at ${messageTime(message.read_at)}` : "Sent; not yet read"} className="ml-1 inline-flex items-center gap-1">{message.read_at ? <CheckCheck className="size-3.5" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}{message.read_at ? "Seen" : "Sent"}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!current.messages?.length && <div className="grid min-h-64 place-items-center text-center"><div><MessageCircle className="mx-auto size-9 text-subtle" aria-hidden="true" /><p className="mt-3 text-sm font-medium">Start the conversation</p><p className="mt-1 text-xs text-muted">Ask about availability, condition, or collection.</p></div></div>}
            </div>
          </>
        ) : (
          <div className="grid min-h-[32rem] flex-1 place-items-center p-8 text-center">
            <div><MessageCircle className="mx-auto size-10 text-subtle" aria-hidden="true" /><h2 className="mt-4 font-semibold">{activeId ? "Loading conversation..." : "Choose a conversation"}</h2><p className="mt-2 text-sm text-muted">Select an enquiry to view its messages and listing.</p></div>
          </div>
        )}

        {error && error !== SESSION_ERROR_MESSAGE && <div role="alert" className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-danger">{error}</div>}

        <form onSubmit={send} className="mt-auto border-t border-border bg-surface p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <label className="min-w-0 flex-1"><span className="sr-only">Message</span><textarea aria-label="Message" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!current || sending} required maxLength={2000} rows={2} placeholder="Write a message" className="block min-h-12 w-full resize-none rounded-control border border-border-strong bg-background px-3 py-2.5 text-sm outline-none placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60" /></label>
            <button type="submit" disabled={!current || !draft.trim() || sending} aria-label={sending ? "Sending message" : "Send message"} title={sending ? "Sending message" : "Send message"} className="grid size-12 shrink-0 place-items-center rounded-control bg-primary text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-5" aria-hidden="true" /></button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-muted"><p className="flex items-center gap-1"><ShieldCheck className="size-3.5" aria-hidden="true" />Keep payment and meetup details in Marketplace.</p><span>{draft.length}/2000</span></div>
        </form>
      </div>
    </section>
  );
}
