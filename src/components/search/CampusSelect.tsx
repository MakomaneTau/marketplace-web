"use client";

import { useEffect, useState } from "react";

import { LoadingSplash } from "@/components/ui/LoadingSplash";
import { apiPublic } from "@/lib/api";

type Campus = {
  id: string;
  name: string;
  university: { name: string; acronym: string };
};
export function CampusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    apiPublic<Campus[]>("/campuses", { signal: controller.signal })
      .then((data) => {
        setCampuses(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <div>
      <label className="block text-sm font-semibold">
        Pickup campus
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={status !== "ready"}
          className="mt-1.5 h-11 w-full rounded-control border border-border bg-background px-3 font-normal disabled:opacity-60"
        >
          <option value="">
            {status === "loading" ? "Loading campuses…" : "All campuses"}
          </option>
          {value && !campuses.some((campus) => campus.id === value) && (
            <option value={value}>Selected campus</option>
          )}
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.university.acronym || campus.university.name} ·{" "}
              {campus.name}
            </option>
          ))}
        </select>
      </label>
      {status === "loading" && (
        <LoadingSplash compact label="Loading campuses…" />
      )}
      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-danger">
          Campuses could not be loaded.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              setStatus("loading");
              setAttempt((current) => current + 1);
            }}
          >
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
