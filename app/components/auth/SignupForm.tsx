"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, Mail, MailCheck, RotateCcw, ShoppingBag, Store, UserPlus, UserRound, type LucideIcon } from "lucide-react";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { apiErrorMessage, apiPublic, signup } from "@/app/libs/api";
import { cn } from "@/app/libs/utils";
import type { UserRole } from "@/app/types/auth";

interface UniversityOption { id: string; name: string; slug: string }

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("buyer");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(true);
  const [universityError, setUniversityError] = useState<string | null>(null);

  const isBuyer = role === "buyer";

  useEffect(() => {
    void apiPublic<UniversityOption[]>("/universities")
      .then(setUniversities)
      .catch(() => setUniversityError("Universities could not be loaded."))
      .finally(() => setUniversitiesLoading(false));
  }, []);

  async function retryUniversities() {
    setUniversitiesLoading(true);
    setUniversityError(null);
    try {
      setUniversities(await apiPublic<UniversityOption[]>("/universities"));
    } catch {
      setUniversityError("Universities could not be loaded.");
    } finally {
      setUniversitiesLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const form = new FormData(event.currentTarget);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    const payload = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      password,

      role,

      universitySlug: form.get("university") || null,
    };

    try {
      setIsSubmitting(true);

      const result = await signup(payload);
      setPassword("");
      setConfirmPassword("");
      if (!result.authenticated) {
        setConfirmationEmail(String(payload.email).trim());
        return;
      }
      router.replace(result.profile?.role === "seller" ? "/seller" : "/");
      router.refresh();
    } catch (error) {
      setError(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmationEmail) return (
    <section role="status" aria-live="polite" className="space-y-5 text-center">
      <MailCheck className="mx-auto size-12 text-primary" aria-hidden="true" />
      <h2 className="text-2xl font-bold">Check your email</h2>
      <p>Check <strong className="break-all">{confirmationEmail}</strong> for your verification email. Follow the link to confirm your email address, then return here to sign in.</p>
      <p className="text-sm text-muted">{"You aren't signed in yet. If the email hasn't arrived, check your spam folder and allow a few minutes."}</p>
      <Link href="/login" className="inline-flex h-11 items-center rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover">Continue to sign in</Link>
    </section>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ========================================
          ACCOUNT TYPE
      ======================================== */}

      <fieldset>
        <legend className="text-sm font-semibold text-foreground">
          What would you like to do?
        </legend>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <RoleButton
            title="Buy"
            description="I'm looking for items"
            icon={ShoppingBag}
            selected={role === "buyer"}
            onClick={() => {
              setRole("buyer");
            }}
          />

          <RoleButton
            title="Sell"
            description="I want to sell items"
            icon={Store}
            selected={role === "seller"}
            onClick={() => {
              setRole("seller");
            }}
          />
        </div>
      </fieldset>

      {/* ========================================
          PERSONAL INFORMATION
      ======================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First name"
          name="firstName"
          autoComplete="given-name"
          placeholder="First name"
          icon={<UserRound className="size-4" />}
          required
        />

        <Input
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          placeholder="Last name"
          icon={<UserRound className="size-4" />}
          required
        />
      </div>

      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        icon={<Mail className="size-4" />}
        required
      />

      {/* ========================================
          STUDENT INFORMATION
      ======================================== */}

        <div className="space-y-4 border-t border-border pt-6">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Your university
            </h2>

            <p className="mt-1 text-xs text-muted">
              {isBuyer ? "Choose your university to help us show relevant items in your area." : "Optionally select a university near your shop."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="university"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                University{!isBuyer && " (optional)"}
              </label>

              <select
                id="university"
                name="university"
                required={isBuyer}
                defaultValue=""
                disabled={universitiesLoading || Boolean(universityError)}
                className="
                  h-11
                  w-full
                  rounded-control
                  border
                  border-border
                  bg-surface
                  px-3
                  text-sm
                  text-foreground
                  outline-none
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                  disabled:cursor-not-allowed
                  disabled:bg-surface-muted
                "
              >
                <option value="" disabled={isBuyer}>
                  {universitiesLoading ? "Loading universities..." : universityError ? "Universities unavailable" : "Select university"}
                </option>

                {universities.map((university) => <option key={university.id} value={university.slug}>{university.name}</option>)}
              </select>
              {universityError && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <p role="alert" className="text-danger">{universityError}</p>
                  <button type="button" onClick={() => void retryUniversities()} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                    <RotateCcw className="size-3.5" aria-hidden="true" />Retry
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      {/* ========================================
          PASSWORD
      ======================================== */}

      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        hint="Use at least 8 characters."
        icon={<LockKeyhole className="size-4" />}
        required
      />

      <Input
        label="Confirm password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Enter your password again"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        icon={<LockKeyhole className="size-4" />}
        required
      />

      {/* ========================================
          TERMS
      ======================================== */}

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 accent-primary"
        />

        <span className="text-sm leading-5 text-muted">
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium text-primary hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div
          role="alert"
          className="
            rounded-control
            border
            border-danger/20
            bg-red-50
            px-4
            py-3
            text-sm
            text-danger
          "
        >
          {error}
        </div>
      )}

      {/* ========================================
          SUBMIT
      ======================================== */}

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting || (isBuyer && (universitiesLoading || Boolean(universityError)))}>
        <UserPlus className="size-5" aria-hidden="true" />
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

/*
|--------------------------------------------------------------------------
| Account-type button
|--------------------------------------------------------------------------
*/

interface RoleButtonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

function RoleButton({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
}: RoleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-card border p-4 text-left transition",

        selected
          ? "border-primary bg-primary-soft"
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted",
      )}
    >
      <span className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-5 shrink-0", selected ? "text-primary" : "text-muted")} aria-hidden="true" />
        <span>
          <span className={cn("block text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>{title}</span>
          <span className="mt-1 block text-xs text-muted">{description}</span>
        </span>
      </span>
    </button>
  );
}
