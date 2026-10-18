"use client";
import { useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { apiRequest, apiErrorMessage } from "@/lib/api";
type Queue = {
  claim: { assigned_to: string } | null;
  assignedToMe: boolean;
  history: { id: string; action: string; reason: string; created_at: string }[];
};
export function QueueTools({
  kind,
  id,
  createdAt,
  open,
}: {
  kind: "report" | "verification";
  id: string;
  createdAt: string;
  open: boolean;
}) {
  const [now] = useState(() => Date.now());
  const [queue, setQueue] = useState<Queue | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    try {
      setQueue(
        await apiRequest<Queue>(`/admin-queue/${kind}/${id}`, { auth: true }),
      );
      setError("");
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function claim(release: boolean) {
    setBusy(true);
    try {
      await apiRequest(`/admin-queue/${kind}/${id}`, {
        auth: true,
        method: "PUT",
        body: JSON.stringify({ release }),
      });
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details
      className="mt-3 w-full text-sm"
      onToggle={(event) => {
        if (event.currentTarget.open && !queue) void load();
      }}
    >
      <summary className="cursor-pointer">
        {open
          ? `Waiting ${Math.max(0, Math.floor((now - Date.parse(createdAt)) / 86400000))} days · `
          : ""}
        Assignment and history
      </summary>
      {error && <p role="alert">{error}</p>}
      {busy && (
        <LoadingSplash compact label="Updating assignment and history…" />
      )}
      {queue && (
        <div className="mt-2 space-y-2">
          <p>
            {queue.assignedToMe
              ? "Assigned to you"
              : queue.claim
                ? "Assigned to another administrator"
                : "Unassigned"}
          </p>
          {open && (!queue.claim || queue.assignedToMe) && (
            <button
              disabled={busy}
              className="underline"
              onClick={() => void claim(queue.assignedToMe)}
            >
              {queue.assignedToMe ? "Release review" : "Claim review"}
            </button>
          )}
          {queue.history.length === 0 ? (
            <p>No decisions recorded.</p>
          ) : (
            queue.history.map((event) => (
              <p key={event.id}>
                {new Date(event.created_at).toLocaleString()} ·{" "}
                {event.action.replaceAll("_", " ")}
                {event.reason ? ` · ${event.reason}` : ""}
              </p>
            ))
          )}
        </div>
      )}
      <button
        disabled={busy}
        onClick={() => void load()}
        className="mt-2 underline"
      >
        Refresh
      </button>
    </details>
  );
}
