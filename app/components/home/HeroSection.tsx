import Link from "next/link";
import {
  ArrowRight,
  Search,
  ShieldCheck,
} from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="
        overflow-hidden
        rounded-card
        bg-primary
        px-5
        py-7
        text-white
        sm:px-8
        sm:py-9
        lg:px-12
        lg:py-12
      "
    >
      <div className="max-w-2xl">
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-white/10
            px-3
            py-1.5
            text-xs
            font-medium
            text-white
          "
        >
          <ShieldCheck className="size-4" />

          Student marketplace
        </div>

        <h1
          className="
            mt-4
            max-w-xl
            text-2xl
            font-bold
            leading-tight
            sm:text-3xl
            lg:text-4xl
          "
        >
          Find what you need around your campus.
        </h1>

        <p
          className="
            mt-3
            max-w-lg
            text-sm
            leading-6
            text-white/80
            sm:text-base
          "
        >
          Discover textbooks, electronics, furniture,
          clothing and other items from students around
          you.
        </p>

        {/* Mobile search */}

        <form
          role="search"
          className="relative mt-6 md:hidden"
        >
          <Search
            className="
              absolute
              left-3
              top-1/2
              size-5
              -translate-y-1/2
              text-muted
            "
          />

          <input
            type="search"
            placeholder="What are you looking for?"
            className="
              h-12
              w-full
              rounded-control
              bg-white
              pl-10
              pr-4
              text-sm
              text-foreground
              outline-none
              placeholder:text-muted
            "
          />
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-control
              bg-white
              px-5
              text-sm
              font-semibold
              text-primary
              transition
              hover:bg-white/90
            "
          >
            Browse marketplace

            <ArrowRight className="size-4" />
          </Link>

        </div>
      </div>
    </section>
  );
}