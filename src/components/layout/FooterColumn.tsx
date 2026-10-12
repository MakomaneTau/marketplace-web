"use client";

import Link from "next/link";

interface FooterColumnProps {
  title: string;

  links: {
    label: string;
    href: string;
  }[];
}

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>

      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="
                text-sm
                text-muted
                transition
                hover:text-primary
              "
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}