"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  type InputHTMLAttributes,
  useId,
  useState,
} from "react";

import { cn } from "../../libs/utils";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  id,
  label,
  error,
  hint,
  className,
  type,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";

  const helpId = `${inputId}-help`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error || hint
              ? helpId
              : undefined
          }
          className={cn(
            "h-11 w-full rounded-control border bg-surface px-3",
            "text-sm text-foreground placeholder:text-subtle",
            "transition-colors",
            "outline-none",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            error
              ? "border-danger"
              : "border-border",
            className,
            isPassword && "pr-12",
          )}
          {...props}
          type={isPassword && passwordVisible ? "text" : type}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={`${passwordVisible ? "Hide" : "Show"} ${label?.toLowerCase() || "password"}`}
            aria-controls={inputId}
            aria-pressed={passwordVisible}
            disabled={props.disabled}
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
          >
            {passwordVisible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
          </button>
        )}
      </div>

      {(error || hint) && (
        <p
          id={helpId}
          className={cn(
            "mt-1 text-xs",
            error
              ? "text-danger"
              : "text-muted",
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
