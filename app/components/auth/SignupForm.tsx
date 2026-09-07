"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);

  const isBuyer = role === "buyer";

  useEffect(() => { apiPublic<UniversityOption[]>("/universities").then(setUniversities).catch(() => setUniversities([])); }, []);

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
      router.replace(result.user.user_metadata?.role === "seller" ? "/seller" : "/");
      router.refresh();
    } catch (error) {
      setError(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ========================================
          ACCOUNT TYPE
      ======================================== */}

      <fieldset>
        <legend className="text-sm font-semibold text-foreground">
          What would you like to do?
        </legend>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <RoleButton
            title="Buy"
            description="I'm looking for items"
            selected={role === "buyer"}
            onClick={() => {
              setRole("buyer");
            }}
          />

          <RoleButton
            title="Sell"
            description="I want to sell items"
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
          required
        />

        <Input
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          placeholder="Last name"
          required
        />
      </div>

      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
      />

      {/* ========================================
          STUDENT INFORMATION
      ======================================== */}

        <div
          className="
            space-y-4
            rounded-card
            border
            border-border
            bg-surface-muted/50
            p-4
          "
        >
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
                "
              >
                <option value="" disabled={isBuyer}>
                  Select university
                </option>

                {universities.map((university) => <option key={university.id} value={university.slug}>{university.name}</option>)}
              </select>
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
          <a href="/terms" className="font-medium text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="font-medium text-primary hover:underline"
          >
            Privacy Policy
          </a>
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

      <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
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
  selected: boolean;
  onClick: () => void;
}

function RoleButton({
  title,
  description,
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
      <span
        className={cn(
          "block text-sm font-semibold",

          selected ? "text-primary" : "text-foreground",
        )}
      >
        {title}
      </span>

      <span className="mt-1 block text-xs text-muted">{description}</span>
    </button>
  );
}
