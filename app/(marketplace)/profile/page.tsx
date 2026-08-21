"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { Container } from "@/app/components/layout/Container";
import { apiErrorMessage, apiRequest } from "@/app/libs/api";

type Profile = { firstName: string; lastName: string; displayName: string; phone: string | null; role: string; university: { name: string } | null; campus: { name: string } | null; verificationStatus: string; rating: number; reviewCount: number };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { apiRequest<Profile>("/profile", { auth: true }).then(setProfile).catch((requestError) => setError(apiErrorMessage(requestError))); }, []);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); try { setProfile(await apiRequest<Profile>("/profile", { method: "PATCH", auth: true, body: JSON.stringify({ firstName: data.get("firstName"), lastName: data.get("lastName"), displayName: data.get("displayName"), phone: data.get("phone") || null }) })); setEditing(false); } catch (requestError) { setError(apiErrorMessage(requestError)); } }
  if (!profile && !error) return <p className="py-16 text-center text-muted">Loading profile...</p>;
  return <Container className="max-w-4xl py-10">{profile && <><section className="rounded-card border border-border bg-surface p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">{profile.displayName}</h1><p className="mt-1 text-muted">{profile.university?.name || "University not selected"} · {profile.campus?.name || "Campus not selected"}</p><p className="mt-2 text-sm capitalize text-primary">{profile.verificationStatus.replaceAll("_", " ")} · {profile.role}</p></div><button onClick={() => setEditing(!editing)} className="rounded-control border px-4 py-2 text-sm font-semibold">{editing ? "Cancel" : "Edit profile"}</button></div>{editing && <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2"><input name="firstName" defaultValue={profile.firstName} className="rounded-control border px-4 py-3"/><input name="lastName" defaultValue={profile.lastName} className="rounded-control border px-4 py-3"/><input name="displayName" defaultValue={profile.displayName} className="rounded-control border px-4 py-3"/><input name="phone" defaultValue={profile.phone || ""} className="rounded-control border px-4 py-3"/><button className="rounded-control bg-primary px-4 py-3 font-semibold text-white sm:col-span-2">Save profile</button></form>}</section><section className="mt-6 grid gap-4 sm:grid-cols-3"><Link href="/orders" className="rounded-card border bg-surface p-5 font-semibold">My orders</Link><Link href="/favourites" className="rounded-card border bg-surface p-5 font-semibold">Favourites</Link><div className="rounded-card border bg-surface p-5"><strong>{profile.rating.toFixed(1)}</strong><p className="text-xs text-muted">{profile.reviewCount} reviews</p></div></section></>}{error && <p role="alert" className="text-danger">{error}</p>}</Container>;
}
