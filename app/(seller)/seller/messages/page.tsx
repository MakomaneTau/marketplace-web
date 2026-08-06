"use client";

import { MoreVertical, Search, Send, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { sellerMessages } from "@/app/data/seller";

export default function SellerMessagesPage() {
  const active = sellerMessages[0];

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Buyer communication"
        title="Messages"
        description="Answer product questions and agree on safe collection or delivery details."
      />

      <section className="grid min-h-650px overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input placeholder="Search messages" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
            </label>
          </div>
          <div className="max-h-260px divide-y divide-slate-100 overflow-y-auto lg:max-h-585px">
            {sellerMessages.map((message, index) => (
              <button
                key={message.id}
                type="button"
                className={`flex w-full gap-3 p-4 text-left transition hover:bg-slate-50 ${index === 0 ? "bg-violet-50" : ""}`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {message.name.split(" ").map((part) => part[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-bold text-slate-950">{message.name}</span>
                    <span className="text-[11px] text-slate-400">{message.time}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-violet-700">{message.product}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="truncate text-xs text-slate-500">{message.preview}</span>
                    {message.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-600" />}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-h-500px flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">LM</span>
              <div>
                <p className="text-sm font-bold text-slate-950">{active.name}</p>
                <p className="text-xs text-slate-500">About: {active.product}</p>
              </div>
            </div>
            <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Conversation options">
              <MoreVertical className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6">
            <div className="mx-auto flex max-w-md items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Keep payment and personal information private. Meet in a public, well-lit location.
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                Hi, is the calculator still available?
                <p className="mt-1 text-right text-[10px] text-slate-400">14:28</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-violet-700 px-4 py-3 text-sm text-white shadow-sm">
                Yes, it is available. It is in good condition and includes the cover.
                <p className="mt-1 text-right text-[10px] text-violet-200">14:30</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                Hi, can I collect it after my 4pm lecture?
                <p className="mt-1 text-right text-[10px] text-slate-400">14:32</p>
              </div>
            </div>
          </div>

          <form className="border-t border-slate-200 bg-white p-4" onSubmit={(event) => event.preventDefault()}>
            <div className="flex items-end gap-2">
              <textarea rows={1} placeholder="Write a message" className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-700 text-white hover:bg-violet-800" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
