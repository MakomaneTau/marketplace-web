"use client";
import { useCallback, useEffect, useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, apiErrorMessage } from "@/lib/api";
type Plan = {
  proposed_by: string;
  meeting_at: string;
  location: string;
  status: string;
};
export function PickupPlan({
  orderId,
  status,
  buyer = false,
  onChanged,
}: {
  orderId: string;
  status: string;
  buyer?: boolean;
  onChanged: () => void;
}) {
  const { auth } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setPlan(
        await apiRequest<Plan | null>(`/pickup-plans/${orderId}`, {
          auth: true,
        }),
      );
      setError("");
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initial);
  }, [load]);
  async function update(body: unknown) {
    setBusy(true);
    try {
      await apiRequest(`/pickup-plans/${orderId}`, {
        auth: true,
        method: "PUT",
        body: JSON.stringify(body),
      });
      await load();
      onChanged();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const closed = ["completed", "cancelled"].includes(status);
  return (
    <details className="my-4 border-t border-border pt-4">
      <summary className="cursor-pointer font-semibold">
        Arrange campus pickup{plan ? ` · ${plan.status}` : ""}
      </summary>
      {loading && <LoadingSplash compact label="Loading pickup plan..." />}
      {error && (
        <p role="alert">
          {error}{" "}
          <button onClick={() => void load()} className="underline">
            Retry
          </button>
        </p>
      )}
      {plan && (
        <div className="my-3">
          <p>
            {new Date(plan.meeting_at).toLocaleString()} · {plan.location}
          </p>
          <p className="text-sm text-muted">
            {plan.status === "proposed"
              ? "Waiting for the other person to confirm."
              : plan.status === "confirmed"
                ? "Both parties have agreed to this pickup."
                : "Collection recorded."}
          </p>
          {!closed &&
            plan.status === "proposed" &&
            plan.proposed_by !== auth?.user.id && (
              <button
                disabled={busy}
                onClick={() => void update({ action: "confirm" })}
                className="py-2 underline"
              >
                Confirm pickup
              </button>
            )}
          {!closed &&
            buyer &&
            status === "ready" &&
            plan.status === "confirmed" && (
              <button
                disabled={busy}
                onClick={() => void update({ action: "collect" })}
                className="py-2 underline"
              >
                I have collected my order
              </button>
            )}
        </div>
      )}
      {!closed && (
        <form
          className="mt-3 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void update({
              action: "propose",
              meetingAt: new Date(String(data.get("time"))).toISOString(),
              location: data.get("location"),
            });
          }}
        >
          <label>
            Propose a time
            <input
              className="block w-full rounded border p-2"
              type="datetime-local"
              name="time"
              required
            />
          </label>
          <label>
            Meeting point
            <input
              className="block w-full rounded border p-2"
              name="location"
              minLength={3}
              maxLength={200}
              required
              placeholder="Library entrance"
            />
          </label>
          <button disabled={busy} className="text-left underline">
            {plan ? "Propose a different pickup" : "Propose pickup"}
          </button>
        </form>
      )}
    </details>
  );
}
