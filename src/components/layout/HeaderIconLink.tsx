import Link from "next/link";

interface HeaderIconLinkProps {
  href: string;
  label: string;
  title?: string;
  children: React.ReactNode;
}

export function HeaderIconLink({
  href,
  label,
  title,
  children,
}: HeaderIconLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={title}
      className="
                flex
                size-11
                items-center
                justify-center
                rounded-control
                text-foreground
                transition
                hover:bg-surface-muted
                hover:cursor-pointer
                hover:text-primary
            "
    >
      {children}
    </Link>
  );
}
