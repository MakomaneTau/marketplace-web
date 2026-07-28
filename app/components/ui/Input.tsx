import {
  type InputHTMLAttributes,
  useId,
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
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

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
        )}
        {...props}
      />

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