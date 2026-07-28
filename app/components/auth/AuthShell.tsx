import Link from "next/link";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;

  footerText: string;
  footerLinkText: string;
  footerHref: string;
}

export function AuthShell({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthShellProps) {
  return (
    <div>
      <main className="flex min-h-screen">
        <section className="hidden w-1/2 flex-col justify-between bg-primary p-10 text-white lg:flex">
          <Link href="/" className="text-2xl font-bold">
            Marketplace
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Your campus marketplace
            </h2>

            <p className="mt-4 text-lg text-white/80">
              Buy what you need, sell what you no longer use, and connect with
              people around your university community.
            </p>
          </div>
        </section>

        <section className="w-full flex-1 flex flex-col justify-center mx-auto px-6 py-10 sm:px-8 lg:w-1/2 lg:max-w-none lg:px-12">
          <Link
            href="/"
            className="mb-10 block text-xl font-bold text-primary lg:hidden"
          >
            Marketplace
          </Link>

          <header>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 text-sm text-muted sm:text-base">
              {description}
            </p>
          </header>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-muted">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="font-semibold text-primary hover:underline"
            >
              {footerLinkText}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
