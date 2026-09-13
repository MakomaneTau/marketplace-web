"use client";

import { Bookmark, MessageCircle, Share2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/app/hooks/use-auth";
import { apiErrorMessage, apiRequest, SESSION_ERROR_MESSAGE } from "@/app/libs/api";

interface ProductActionsProps {
  productId: string;
  productName: string;
  initialSaved?: boolean;
}

export function ProductActions({ productId, productName, initialSaved = false }: ProductActionsProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busyAction, setBusyAction] = useState<"save" | "message" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
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
    if (!guard() || busyAction) return;
    setBusyAction("save");
    setError(null);
    setFeedback(null);
    try {
      await apiRequest(`/favourites/${productId}`, {
        method: saved ? "DELETE" : "PUT",
        auth: true,
      });
      setSaved((current) => !current);
      setFeedback(saved ? "Removed from favourites" : "Saved to favourites");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusyAction(null);
    }
  }

  async function message() {
    if (!guard() || busyAction) return;
    setBusyAction("message");
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
      setBusyAction(null);
    }
  }

  async function share() {
    const shareData = { title: productName, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setFeedback("Product link copied");
      }
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      setError("The product link could not be shared. Please copy it from your browser.");
    }
  }

  return (
    <div className="mt-7">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={message}
          disabled={Boolean(busyAction) || !ready}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          {busyAction === "message" ? "Opening conversation..." : "Message seller"}
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => { if (guard()) router.push(`/cart?product=${productId}`); }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-primary bg-white px-5 text-sm font-semibold text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingCart className="size-5" aria-hidden="true" />
          Buy now
        </button>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={save}
          disabled={Boolean(busyAction) || !ready}
          aria-label={saved ? "Remove from favourites" : "Save to favourites"}
          aria-pressed={saved}
          title={saved ? "Remove from favourites" : "Save to favourites"}
          className="flex size-11 items-center justify-center rounded-control border border-border-strong bg-white text-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <Bookmark className="size-5" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={share}
          aria-label="Share product"
          title="Share product"
          className="flex size-11 items-center justify-center rounded-control border border-border-strong bg-white text-foreground transition hover:border-primary hover:text-primary"
        >
          <Share2 className="size-5" aria-hidden="true" />
        </button>
      </div>

      {feedback && <p className="mt-3 text-sm font-medium text-secondary" role="status">{feedback}</p>}
      {error && (
        <div role="alert" className="mt-3 rounded-control border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
          <p>{error}</p>
          {error === SESSION_ERROR_MESSAGE && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/login" className="rounded-control bg-primary px-4 py-2 font-semibold text-white">Sign in</Link>
              <Link href="/" className="rounded-control border border-border bg-white px-4 py-2 font-semibold text-foreground">Back to marketplace</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
