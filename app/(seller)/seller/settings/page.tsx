"use client";

import { FormEvent, useEffect, useState } from "react";

import { SectionHeading } from "@/app/components/seller/section-heading";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

type Profile = { firstName: string; lastName: string; displayName: string; phone: string | null; verificationStatus: string };
type Settings = { notify_new_orders: boolean; notify_new_messages: boolean; notify_listing_updates: boolean; notify_marketplace_tips: boolean };
const labels: Record<keyof Settings, string> = { notify_new_orders: "New orders", notify_new_messages: "New messages", notify_listing_updates: "Listing updates", notify_marketplace_tips: "Marketplace tips" };

export default function SellerSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { Promise.all([apiRequest<Profile>("/profile", { auth: true }), apiRequest<Settings>("/settings", { auth: true })]).then(([nextProfile, nextSettings]) => { setProfile(nextProfile); setSettings(nextSettings); }).catch((requestError) => setError(apiErrorMessage(requestError))); }, []);
  async function saveProfile(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { setProfile(await apiRequest<Profile>("/profile", { method: "PATCH", auth: true, body: JSON.stringify({ firstName: data.get("firstName"), lastName: data.get("lastName"), displayName: data.get("displayName"), phone: data.get("phone") || null }) })); setMessage("Account saved."); } catch (requestError) { setError(apiErrorMessage(requestError)); } }
  async function toggle(key: keyof Settings) { if (!settings) return; const next = { ...settings, [key]: !settings[key] }; setSettings(next); try { setSettings(await apiRequest<Settings>("/settings", { method: "PATCH", auth: true, body: JSON.stringify({ [key]: next[key] }) })); } catch (requestError) { setSettings(settings); setError(apiErrorMessage(requestError)); } }
  return <div className="space-y-6"><SectionHeading eyebrow="Preferences" title="Seller settings" description="Manage your seller account and notifications."/>{profile && <form key={profile.displayName} onSubmit={saveProfile} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Seller account</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><input name="firstName" defaultValue={profile.firstName} placeholder="First name" className="rounded-xl border px-4 py-3"/><input name="lastName" defaultValue={profile.lastName} placeholder="Last name" className="rounded-xl border px-4 py-3"/><input name="displayName" defaultValue={profile.displayName} placeholder="Display name" className="rounded-xl border px-4 py-3"/><input name="phone" defaultValue={profile.phone || ""} placeholder="Phone" className="rounded-xl border px-4 py-3"/></div><button className="mt-5 rounded-xl bg-violet-700 px-4 py-2.5 font-semibold text-white">Save account</button><p className="mt-3 text-xs text-slate-500">Verification: {profile.verificationStatus}</p></form>}{settings && <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">Notifications</h2><div className="mt-4 divide-y">{(Object.keys(labels) as (keyof Settings)[]).map((key) => <label key={key} className="flex justify-between py-4"><span>{labels[key]}</span><input type="checkbox" checked={settings[key]} onChange={() => toggle(key)} className="h-5 w-5 accent-violet-700"/></label>)}</div></section>}{message && <p className="text-emerald-700">{message}</p>}{error && <p role="alert" className="text-red-700">{error}</p>}</div>;
}
