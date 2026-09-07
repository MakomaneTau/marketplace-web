"use client";

import { Heart, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/app/hooks/use-auth";
import { apiErrorMessage, apiRequest, SESSION_ERROR_MESSAGE } from "@/app/libs/api";

export function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { auth, ready } = useAuth();

  function guard() {
    if (!ready) return false;
    if (!auth) {
      router.push("/login");
      return false;
    }
    return true;
  }

  async function save() {
    if (!guard() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await apiRequest(`/favourites/${productId}`, {
        method: saved ? "DELETE" : "PUT",
        auth: true,
      });
      setSaved((current) => !current);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function message() {
    if (!guard() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const conversation = await apiRequest<{ id: string }>("/conversations", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ productId }),
      });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-7">
      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" disabled={!ready} onClick={() => { if (guard()) router.push(`/cart?product=${productId}`); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-accent px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
          <ShoppingCart className="size-5" /> Buy now
        </button>
        <button type="button" onClick={message} disabled={busy || !ready} className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
          <MessageCircle className="size-5" /> Message seller
        </button>
        <button type="button" onClick={save} disabled={busy || !ready} className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60">
          <Heart className="size-5" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save item"}
        </button>
      </div>
      {error && <div role="alert" className="mt-3 rounded-control border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger"><p>{error}</p>{error === SESSION_ERROR_MESSAGE && <div className="mt-3 flex flex-wrap gap-2"><Link href="/login" className="rounded-control bg-primary px-4 py-2 font-semibold text-white">Sign in</Link><Link href="/" className="rounded-control border border-border bg-white px-4 py-2 font-semibold text-foreground">Back to marketplace</Link></div>}</div>}
    </div>
  );
}
