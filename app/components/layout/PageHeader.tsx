import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}
