import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/app/components/layout/Container";
import { PageHeader } from "@/app/components/layout/PageHeader";

interface InformationSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}
interface InformationAction {
  href: string;
  label: string;
}

interface InformationPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  notice?: string;
  sections: InformationSection[];
  actions?: InformationAction[];
}

export function InformationPage({
  icon,
  title,
  description,
  notice,
  sections,
  actions = [],
}: InformationPageProps) {
  return (
    <Container className="max-w-4xl py-6 md:py-8 lg:py-10">
      <PageHeader icon={icon} title={title} description={description} />

      {notice && (
        <aside className="mt-8 rounded-card border border-primary/20 bg-primary-soft p-5 text-sm leading-6 text-foreground">
          {notice}
        </aside>
      )}

      <div className="mt-8 space-y-5">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-card border border-border bg-surface p-5 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {section.title}
            </h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-7 text-muted">
                {paragraph}
              </p>
            ))}

            {section.items && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted marker:text-primary">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {actions.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-3" aria-label={`${title} actions`}>
          {actions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                index === 0
                  ? "rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
                  : "rounded-control border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted"
              }
            >
              {action.label}
            </Link>
          ))}
        </nav>
      )}
    </Container>
  );
}
