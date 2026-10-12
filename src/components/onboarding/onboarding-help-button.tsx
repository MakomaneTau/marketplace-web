"use client";

import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { useOnboarding } from "./onboarding-provider";

export function OnboardingHelpButton({ className }: { className?: string }) {
  const onboarding = useOnboarding();
  if (!onboarding) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={onboarding.open}
    >
      <CircleHelp className="size-4" aria-hidden="true" />
      Getting started
    </Button>
  );
}
