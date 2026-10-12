"use client";

import Link from "next/link";

interface SocialLinkProps {
  label: string;
  href: string;
  children: React.ReactNode;
}

export function SocialLink({ label, href, children }: SocialLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="
        flex
        size-9
        items-center
        justify-center
        rounded-full
        border
        border-border
        text-muted
        transition
        hover:border-primary
        hover:text-primary
      "
    >
      {children}
    </Link>
  );
}
