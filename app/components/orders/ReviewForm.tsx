"use client";

import { FormEvent, useState } from "react";

import { apiErrorMessage, apiRequest } from "@/app/libs/api";

export function ReviewForm({ orderId, productId }: { orderId: string; productId: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest(`/orders/${orderId}/reviews`, { method: "POST", auth: true, body: JSON.stringify({ productId, rating: Number(form.get("rating")), comment: form.get("comment") }) });
      setDone(true);
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
  }

  if (done) return <p className="mt-4 text-sm text-secondary">Review submitted.</p>;
  return <form onSubmit={submit} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[100px_1fr_auto]"><select name="rating" aria-label="Rating" className="rounded-control border px-3"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input name="comment" required minLength={10} maxLength={1000} placeholder="Share at least 10 characters" className="rounded-control border px-3 py-2"/><button className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white">Review</button>{error && <p role="alert" className="text-sm text-danger sm:col-span-3">{error}</p>}</form>;
}
