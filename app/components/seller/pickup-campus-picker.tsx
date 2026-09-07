"use client";

import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";

import { apiErrorMessage, apiPublic } from "@/app/libs/api";

type University = { id: string; name: string; slug: string };
export type PickupCampus = { id: string; name: string; university: University };

export function PickupCampusPicker({ value, onChange }: { value: PickupCampus[]; onChange: (campuses: PickupCampus[]) => void }) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [slug, setSlug] = useState("");
  const [options, setOptions] = useState<{ slug: string; campuses: PickupCampus[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    apiPublic<University[]>("/universities").then((items) => { if (active) setUniversities(items); })
      .catch((e: unknown) => { if (active) setError(apiErrorMessage(e)); });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => {
    if (!slug) return;
    let active = true;
    apiPublic<{ university: University; campuses: { id: string; name: string }[] }>(`/universities/${slug}/campuses`)
      .then(({ university, campuses }) => {
        if (active) setOptions({ slug, campuses: campuses.map((campus) => ({ ...campus, university })) });
      }).catch((e: unknown) => { if (active) setError(apiErrorMessage(e)); });
    return () => { active = false; };
  }, [slug, retry]);
  return (
    <section className="space-y-4 rounded-xl bg-slate-50 p-4">
      <div><h2 className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-violet-700" />Pickup campuses</h2>
        <p className="mt-1 text-sm text-slate-500">Select up to 10 campuses, including campuses at different universities.</p></div>
      <label className="block text-sm font-medium">University
        <select value={slug} onChange={(event) => { setError(null); setSlug(event.target.value); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
          <option value="">Select university</option>
          {universities.map((university) => <option key={university.id} value={university.slug}>{university.name}</option>)}
        </select>
      </label>
      {slug && !error && (options?.slug !== slug ? <p role="status" className="text-sm text-slate-500">Loading campuses...</p> :
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-medium">Available campuses</legend>
          {options.campuses.map((campus) => {
            const selected = value.some((item) => item.id === campus.id);
            return <label key={campus.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${selected ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white"}`}>
              <input type="checkbox" checked={selected} disabled={!selected && value.length >= 10} onChange={() => onChange(selected ? value.filter((item) => item.id !== campus.id) : [...value, campus])} className="size-4 accent-violet-700" />{campus.name}
            </label>;
          })}
          {!options.campuses.length && <p className="text-sm text-slate-500">No campuses are available for this university.</p>}
        </fieldset>)}
      {error && <div role="alert" className="text-sm text-red-700">{error} <button type="button" onClick={() => { setError(null); setRetry((n) => n + 1); }} className="underline">Retry</button></div>}
      <div className="space-y-2"><p className="text-sm font-medium">Selected campuses ({value.length})</p>
        <div className="flex flex-wrap gap-2">{value.map((campus) => <span key={campus.id} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white py-2 pl-3 pr-1 text-sm text-violet-900">
          <span>{campus.name}<span className="block text-xs text-slate-500">{campus.university.name}</span></span>
          <button type="button" aria-label={`Remove ${campus.name}, ${campus.university.name}`} onClick={() => onChange(value.filter((item) => item.id !== campus.id))} className="rounded-lg p-2 hover:bg-violet-50"><X className="size-4" /></button>
        </span>)}</div>
        {!value.length && <p className="text-sm text-slate-500">No pickup campuses selected yet.</p>}
      </div>
    </section>
  );
}
