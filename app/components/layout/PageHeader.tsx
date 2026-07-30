import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <header>
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-card bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="size-6" />
        </div>
      )}

      <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}
