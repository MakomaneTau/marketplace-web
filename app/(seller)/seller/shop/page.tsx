"use client";

import { FormEvent, useEffect, useState } from "react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { SectionHeading } from "@/app/components/seller/section-heading";
import { apiErrorMessage, apiPublic, apiRequest, notifySellerDataChanged, SESSION_ERROR_MESSAGE } from "@/app/libs/api";

type University = { id: string; name: string; slug: string };
type Campus = { id: string; name: string };
type CampusResponse = { university: University; campuses: Campus[] };
type Shop = { id: string; name: string; tagline: string | null; description: string | null; is_open: boolean; logo_url: string | null; banner_url: string | null; pickup_areas: { campus: Campus & { university: University } }[] };

export default function SellerShopPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [universitySlug, setUniversitySlug] = useState("");
  const [campusIds, setCampusIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiPublic<University[]>("/universities").then(setUniversities);
    apiRequest<Shop | null>("/seller/shop", { auth: true }).then((value) => {
      setShop(value);
      setCampusIds(value?.pickup_areas.map((area) => area.campus.id) || []);
      setLoaded(true);
    }).catch((requestError) => { setError(apiErrorMessage(requestError)); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (!universitySlug) return;
    apiPublic<CampusResponse>(`/universities/${universitySlug}/campuses`)
      .then((response) => setCampuses(response.campuses))
      .catch(() => setCampuses([]));
  }, [universitySlug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setError(null);
      const input = { name: form.get("name"), tagline: form.get("tagline"), description: form.get("description"), isOpen: form.get("isOpen") === "on" };
      const saved = await apiRequest<Shop>("/seller/shop", { method: shop ? "PATCH" : "POST", auth: true, body: JSON.stringify(input) });
      const updated = await apiRequest<Shop>("/seller/shop/pickup-areas", { method: "PUT", auth: true, body: JSON.stringify({ campusIds }) });
      setShop({ ...saved, pickup_areas: updated.pickup_areas });
      notifySellerDataChanged();
      setMessage("Shop changes saved.");
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
  }

  async function upload(kind: "logo" | "banner", file?: File) {
    if (!file) return;
    const body = new FormData(); body.append("image", file);
    try { setShop(await apiRequest<Shop>(`/seller/shop/${kind}`, { method: "POST", auth: true, body })); notifySellerDataChanged(); } catch (requestError) { setError(apiErrorMessage(requestError)); }
  }

  if (!loaded) return <p className="py-12 text-center text-sm text-slate-500">Loading shop...</p>;
  if (error === SESSION_ERROR_MESSAGE) return <ProtectedRequestError message={error} />;

  return <div className="space-y-6"><SectionHeading eyebrow="Storefront" title="My shop" description="Build buyer trust with a clear shop identity and collection information."/><form onSubmit={submit} className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Shop name<input name="name" required minLength={3} defaultValue={shop?.name || ""} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="text-sm font-semibold">Tagline<input name="tagline" defaultValue={shop?.tagline || ""} className="mt-2 w-full rounded-xl border px-4 py-3"/></label></div><label className="block text-sm font-semibold">About your shop<textarea name="description" rows={5} defaultValue={shop?.description || ""} className="mt-2 w-full rounded-xl border px-4 py-3"/></label><label className="flex items-center gap-3 text-sm font-semibold"><input name="isOpen" type="checkbox" defaultChecked={shop?.is_open ?? true}/>Open for orders</label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Logo<input type="file" accept="image/*" onChange={(event) => upload("logo", event.target.files?.[0])} className="mt-2 block w-full cursor-pointer rounded-xl border border-slate-300 bg-slate-50 p-1.5 text-sm font-normal text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-700 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-800"/></label><label className="text-sm font-semibold">Banner<input type="file" accept="image/*" onChange={(event) => upload("banner", event.target.files?.[0])} className="mt-2 block w-full cursor-pointer rounded-xl border border-slate-300 bg-slate-50 p-1.5 text-sm font-normal text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-700 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-800"/></label></div><div className="rounded-xl bg-slate-50 p-4"><h2 className="font-semibold">Pickup campuses</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={universitySlug} onChange={(event) => { setCampuses([]); setUniversitySlug(event.target.value); }} className="rounded-xl border bg-white px-4 py-3"><option value="">Select university</option>{universities.map((university) => <option key={university.id} value={university.slug}>{university.name}</option>)}</select><select onChange={(event) => { const id = event.target.value; if (id && !campusIds.includes(id)) setCampusIds((current) => [...current, id]); }} className="rounded-xl border bg-white px-4 py-3"><option value="">Add campus</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}</select></div><div className="mt-3 flex flex-wrap gap-2">{campusIds.map((id) => <button type="button" key={id} onClick={() => setCampusIds((current) => current.filter((value) => value !== id))} className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-800">{shop?.pickup_areas.find((area) => area.campus.id === id)?.campus.name || campuses.find((campus) => campus.id === id)?.name || id} ×</button>)}</div></div>{message && <p className="text-sm text-emerald-700">{message}</p>}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button className="rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white">Save shop changes</button></form></div>;
}
