"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { cn } from "@/app/libs/utils";
import type { UserRole } from "@/app/types/auth";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("buyer");

  /*
   * Buyers must always be students.
   *
   * Sellers choose whether they are students.
   */
  const [sellerIsStudent, setSellerIsStudent] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudent = role === "buyer" ? true : sellerIsStudent;

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

      isStudent,

      university: isStudent ? form.get("university") : null,

      studentNumber: isStudent ? form.get("studentNumber") : null,
    };

    try {
      setIsSubmitting(true);

      /*
       * Later this payload will be sent to:
       *
       * POST /api/v1/auth/signup
       */

      console.log(payload);
      router.replace("/dashboard");
    } catch {
      setError("Unable to create your account. Please try again.");
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
          SELLER STUDENT QUESTION
      ======================================== */}

      {role === "seller" && (
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Are you currently a student?
          </legend>

          <p className="mt-1 text-sm text-muted">
            Sellers do not have to be students.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSellerIsStudent(true)}
              className={cn(
                "rounded-control border px-4 py-3 text-sm font-medium transition",
                sellerIsStudent
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              Yes
            </button>

            <button
              type="button"
              onClick={() => setSellerIsStudent(false)}
              className={cn(
                "rounded-control border px-4 py-3 text-sm font-medium transition",
                !sellerIsStudent
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              No
            </button>
          </div>
        </fieldset>
      )}

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
        placeholder={isStudent ? "student@university.ac.za" : "you@example.com"}
        required
      />

      {/* ========================================
          STUDENT INFORMATION
      ======================================== */}

      {isStudent && (
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
              Student information
            </h2>

            {role === "buyer" && (
              <p className="mt-1 text-xs text-muted">
                Buyers must be verified students.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="university"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                University
              </label>

              <select
                id="university"
                name="university"
                required
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
                <option value="" disabled>
                  Select university
                </option>

                <option value="wits">University of the Witwatersrand</option>

                <option value="uj">University of Johannesburg</option>

                <option value="up">University of Pretoria</option>

                <option value="uct">University of Cape Town</option>

                <option value="other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Student number"
                name="studentNumber"
                placeholder="Enter your student number"
                required
              />
            </div>
          </div>
        </div>
      )}

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
