"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { apiRequest } from "@/app/libs/api";

const MESSAGE_EVENT = "marketplace-messages-changed";
const UnreadContext = createContext<number | null>(null);
export const useUnreadMessages = () => useContext(UnreadContext);
export function notifyMessagesChanged() {
  window.dispatchEvent(new Event(MESSAGE_EVENT));
}

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    let sequence = 0;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      const current = ++sequence;
      try {
        const result = await apiRequest<{ count: number }>("/conversations/unread-count", { auth: true });
        if (active && current === sequence) setCount(result.count);
      } catch {
        if (active && current === sequence) setCount(null);
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 10000);
    window.addEventListener(MESSAGE_EVENT, refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener(MESSAGE_EVENT, refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return <UnreadContext.Provider value={count}>{children}</UnreadContext.Provider>;
}

export function UnreadMessageBadge() {
  const count = useUnreadMessages();
  if (!count) return null;
  return <span aria-label={`${count} unread messages`} className="inline-flex min-w-5 items-center justify-center rounded-full bg-violet-700 px-1.5 py-0.5 text-[10px] font-bold leading-4 text-white">{count > 99 ? "99+" : count}</span>;
}
