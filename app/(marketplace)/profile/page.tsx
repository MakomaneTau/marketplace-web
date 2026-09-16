"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Heart,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";

import { ProtectedRequestError } from "@/app/components/auth/protected-request-error";
import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import {
  apiErrorMessage,
  apiPublic,
  apiRequest,
  notifySellerDataChanged,
  SESSION_ERROR_MESSAGE,
} from "@/app/libs/api";
import { cn } from "@/app/libs/utils";

interface University {
  id: string;
  name: string;
  acronym: string;
  slug: string;
}

interface Campus {
  id: string;
  name: string;
  city: string | null;
  province: string | null;
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "buyer" | "seller";
  isStudent: boolean;
  university: University | null;
  campus: Campus | null;
  verificationStatus: "pending" | "verified" | "rejected";
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface CampusResponse {
  university: University;
  campuses: Campus[];
}

const selectClassName =
  "h-11 w-full rounded-control border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted";

function initials(profile: Profile) {
  const value = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.trim();
  return value.toUpperCase() || profile.displayName.slice(0, 2).toUpperCase();
}

function memberSince(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(date);
}

function verificationCopy(status: Profile["verificationStatus"]) {
  if (status === "verified") return "Verified account";
  if (status === "rejected") return "Verification needs attention";
  return "Verification pending";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [universities, setUniversities] = useState<University[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [campusesLoading, setCampusesLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setProfile(await apiRequest<Profile>("/profile", { auth: true }));
    } catch (error) {
      setLoadError(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadProfile]);

  async function loadCampuses(universitySlug: string) {
    if (!universitySlug) {
      setCampuses([]);
      setSelectedCampus("");
      return;
    }

    setCampusesLoading(true);
    setLocationError(null);
    try {
      const response = await apiPublic<CampusResponse>(`/universities/${universitySlug}/campuses`);
      setCampuses(response.campuses);
    } catch (error) {
      setCampuses([]);
      setLocationError(apiErrorMessage(error));
    } finally {
      setCampusesLoading(false);
    }
  }

  async function loadLocations(currentProfile: Profile) {
    const universitySlug = currentProfile.university?.slug || "";
    setLocationsLoading(true);
    setLocationError(null);
    try {
      const [universityOptions, campusResponse] = await Promise.all([
        apiPublic<University[]>("/universities"),
        universitySlug
          ? apiPublic<CampusResponse>(`/universities/${universitySlug}/campuses`)
          : Promise.resolve(null),
      ]);
      setUniversities(universityOptions);
      setCampuses(campusResponse?.campuses || []);
    } catch (error) {
      setLocationError(apiErrorMessage(error));
    } finally {
      setLocationsLoading(false);
    }
  }

  function beginEditing() {
    if (!profile) return;
    setSelectedUniversity(profile.university?.slug || "");
    setSelectedCampus(profile.campus?.id || "");
    setSaveError(null);
    setSuccess(null);
    setEditing(true);
    void loadLocations(profile);
  }

  function cancelEditing() {
    setEditing(false);
    setSaveError(null);
    setLocationError(null);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    if (profile.role === "buyer" && !selectedUniversity) {
      setSaveError("Choose your university before saving your profile.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const payload: Record<string, string | null> = {
      firstName: String(data.get("firstName") || "").trim(),
      lastName: String(data.get("lastName") || "").trim(),
      displayName: String(data.get("displayName") || "").trim(),
      phone: String(data.get("phone") || "").trim() || null,
    };

    if (!locationError && !locationsLoading && !campusesLoading) {
      payload.universitySlug = selectedUniversity || null;
      payload.campusId = selectedCampus || null;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const updated = await apiRequest<Profile>("/profile", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(payload),
      });
      setProfile(updated);
      setEditing(false);
      setSuccess("Your profile has been updated.");
      if (updated.role === "seller") notifySellerDataChanged();
    } catch (error) {
      setSaveError(apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ProfileSkeleton />;

  if (loadError === SESSION_ERROR_MESSAGE) {
    return <Container className="py-8"><ProtectedRequestError message={loadError} /></Container>;
  }

  if (!profile || loadError) {
    return (
      <Container className="max-w-3xl py-10">
        <section role="alert" className="rounded-card border border-border bg-surface px-6 py-10 text-center">
          <UserRound className="mx-auto size-9 text-muted" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold">We could not load your profile</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{loadError || "Profile information is unavailable."}</p>
          <Button type="button" className="mt-5" onClick={() => void loadProfile()}>
            <RotateCcw className="size-4" aria-hidden="true" />Retry
          </Button>
        </section>
      </Container>
    );
  }

  const actions = profile.role === "seller"
    ? [
        { href: "/seller", label: "Seller dashboard", description: "Manage your shop", icon: Store },
        { href: "/seller/products", label: "Products", description: "Manage your listings", icon: Package },
        { href: "/seller/messages", label: "Messages", description: "Reply to buyers", icon: MessageCircle },
        { href: "/seller/settings", label: "Settings", description: "Notification preferences", icon: Settings },
      ]
    : [
        { href: "/orders", label: "Orders", description: "Track your purchases", icon: ShoppingBag },
        { href: "/favourites", label: "Favourites", description: "Items you have saved", icon: Heart },
        { href: "/messages", label: "Messages", description: "Chat with sellers", icon: MessageCircle },
      ];

  return (
    <Container className="max-w-7xl py-8 sm:py-10">
      <PageHeader
        title="My profile"
        description="Keep your details current so people across the marketplace can recognise and trust you."
        icon={UserRound}
      />

      {success && (
        <div role="status" aria-live="polite" className="mt-6 flex items-center gap-3 rounded-card border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          <p className="flex-1 font-medium">{success}</p>
          <button type="button" onClick={() => setSuccess(null)} aria-label="Dismiss confirmation" className="rounded-control p-1 hover:bg-success/10 focus-visible:outline-2 focus-visible:outline-success">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-card border border-border bg-surface">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border p-5 sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white" aria-hidden="true">
                {initials(profile)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold sm:text-xl">{profile.displayName}</h2>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                    profile.verificationStatus === "verified" ? "bg-success/10 text-success" : "bg-warning/15 text-foreground",
                  )}>
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    {verificationCopy(profile.verificationStatus)}
                  </span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-muted">
                  <span>{profile.university?.name || "University not selected"}</span>
                  <span aria-hidden="true">/</span>
                  <span>{profile.campus?.name || "Campus not selected"}</span>
                </p>
              </div>
            </div>
            {!editing && (
              <Button type="button" variant="outline" size="sm" onClick={beginEditing}>
                <Pencil className="size-4" aria-hidden="true" />Edit profile
              </Button>
            )}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="p-5 sm:p-6">
              <fieldset disabled={saving} className="space-y-6">
                <div>
                  <h3 className="font-bold">Personal details</h3>
                  <p className="mt-1 text-sm text-muted">These details help buyers and sellers recognise you.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input name="firstName" label="First name" defaultValue={profile.firstName} autoComplete="given-name" maxLength={100} icon={<UserRound className="size-4" />} required />
                  <Input name="lastName" label="Last name" defaultValue={profile.lastName} autoComplete="family-name" maxLength={100} icon={<UserRound className="size-4" />} required />
                  <Input name="displayName" label="Display name" defaultValue={profile.displayName} maxLength={100} hint="This is how other people see you in Marketplace." icon={<UserRound className="size-4" />} required />
                  <Input name="phone" type="tel" label="Phone number (optional)" defaultValue={profile.phone || ""} autoComplete="tel" maxLength={50} placeholder="+27 71 234 5678" icon={<Phone className="size-4" />} />
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-bold">Campus details</h3>
                  <p className="mt-1 text-sm text-muted">Your campus helps us keep discovery and meetups relevant.</p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="profile-university" className="mb-1.5 block text-sm font-medium">University{profile.role === "seller" && " (optional)"}</label>
                      <select
                        id="profile-university"
                        value={selectedUniversity}
                        required={profile.role === "buyer"}
                        disabled={locationsLoading}
                        onChange={(event) => {
                          const slug = event.target.value;
                          setSelectedUniversity(slug);
                          setSelectedCampus("");
                          void loadCampuses(slug);
                        }}
                        className={selectClassName}
                      >
                        <option value="">{locationsLoading ? "Loading universities..." : "Select university"}</option>
                        {universities.map((university) => <option key={university.id} value={university.slug}>{university.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="profile-campus" className="mb-1.5 block text-sm font-medium">Campus (optional)</label>
                      <select
                        id="profile-campus"
                        value={selectedCampus}
                        disabled={!selectedUniversity || locationsLoading || campusesLoading || Boolean(locationError)}
                        onChange={(event) => setSelectedCampus(event.target.value)}
                        className={selectClassName}
                      >
                        <option value="">{campusesLoading ? "Loading campuses..." : "Select campus"}</option>
                        {campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {locationError && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <p role="alert" className="text-danger">{locationError} Your existing campus will not be changed.</p>
                      <button type="button" onClick={() => void loadLocations(profile)} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                        <RotateCcw className="size-4" aria-hidden="true" />Retry locations
                      </button>
                    </div>
                  )}
                </div>

                {saveError && <p role="alert" className="rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{saveError}</p>}

                <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                  <Button type="submit" disabled={saving || campusesLoading}>
                    {saving && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                    {saving ? "Saving changes..." : "Save changes"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancelEditing} disabled={saving}>Cancel</Button>
                </div>
              </fieldset>
            </form>
          ) : (
            <div className="p-5 sm:p-6">
              <h3 className="font-bold">Contact and campus</h3>
              <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <ProfileDetail icon={UserRound} label="Full name" value={`${profile.firstName} ${profile.lastName}`} />
                <ProfileDetail icon={Phone} label="Phone number" value={profile.phone || "Not provided"} />
                <ProfileDetail icon={GraduationCap} label="University" value={profile.university?.name || "Not selected"} />
                <ProfileDetail icon={MapPin} label="Campus" value={profile.campus?.name || "Not selected"} />
              </dl>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-bold">Account overview</h2>
            <dl className="mt-3 divide-y divide-border">
              <OverviewRow icon={GraduationCap} label="Account type" value={profile.role === "seller" ? "Seller" : "Buyer"} />
              <OverviewRow icon={CalendarDays} label="Member since" value={memberSince(profile.createdAt)} />
              <OverviewRow icon={Star} label="Rating" value={profile.reviewCount ? `${profile.rating.toFixed(1)} from ${profile.reviewCount} review${profile.reviewCount === 1 ? "" : "s"}` : "No reviews yet"} />
            </dl>
          </section>

          <nav aria-label="Account pages" className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {actions.map((action) => <AccountLink key={action.href} {...action} />)}
          </nav>
        </aside>
      </div>
    </Container>
  );
}

function ProfileDetail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0"><dt className="text-xs font-semibold uppercase text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>
    </div>
  );
}

function OverviewRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-3 py-3 first:pt-1 last:pb-0">
      <Icon className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden="true" />
      <div><dt className="text-sm font-semibold">{label}</dt><dd className="mt-0.5 text-sm text-muted">{value}</dd></div>
    </div>
  );
}

function AccountLink({ href, label, description, icon: Icon }: { href: string; label: string; description: string; icon: LucideIcon }) {
  return (
    <Link href={href} className="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]">
      <Icon className="size-5 shrink-0 text-muted group-hover:text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{label}</span><span className="block truncate text-xs text-muted">{description}</span></span>
      <ChevronRight className="size-4 shrink-0 text-subtle" aria-hidden="true" />
    </Link>
  );
}

function ProfileSkeleton() {
  return (
    <Container className="max-w-7xl py-10" aria-busy="true" aria-label="Loading profile">
      <div className="h-4 w-36 animate-pulse rounded bg-border motion-reduce:animate-none" />
      <div className="mt-5 h-9 w-48 animate-pulse rounded bg-border motion-reduce:animate-none" />
      <div className="mt-3 h-5 max-w-xl animate-pulse rounded bg-border motion-reduce:animate-none" />
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-96 animate-pulse rounded-card border border-border bg-surface-muted motion-reduce:animate-none" />
        <div className="h-80 animate-pulse rounded-card border border-border bg-surface-muted motion-reduce:animate-none" />
      </div>
    </Container>
  );
}
