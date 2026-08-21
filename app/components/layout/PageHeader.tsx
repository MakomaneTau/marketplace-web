import { ArrowLeft, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <header>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>

      <div className="mt-4 flex items-center gap-3">
        {Icon && <Icon className="size-7 text-primary" />}
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      </div>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}
