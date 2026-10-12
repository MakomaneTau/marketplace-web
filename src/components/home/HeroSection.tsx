import Image from "next/image";
import { ArrowRight, Leaf, MapPin, Search, ShieldCheck, UsersRound } from "lucide-react";

export function HeroSection() {
  return (
    <section className="grid min-h-[30rem] w-full min-w-0 overflow-hidden border-y border-border bg-surface lg:grid-cols-[0.92fr_1.08fr]">
      <div className="flex min-w-0 flex-col justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Built for student-to-student trading
        </p>

        <h1 className="mt-4 max-w-xl text-4xl font-black leading-[1.04] text-foreground sm:text-5xl lg:text-6xl">
          Find it nearby.<br />Buy it safely.
        </h1>

        <p className="hero-mobile-bound mt-5 w-full break-words text-base leading-7 text-muted sm:text-lg">
          Second-hand goods from students at your campus. Real finds, real people, fewer delivery headaches.
        </p>

        <form role="search" action="/search" className="hero-mobile-bound mt-7 flex w-full min-w-0 flex-col gap-2 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search marketplace</span>
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              name="q"
              type="search"
              placeholder="Textbooks, laptops, furniture..."
              className="h-12 w-full rounded-control border border-border-strong bg-white pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-hover">
            Search marketplace <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted sm:text-sm">
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-secondary" aria-hidden="true" />Student verified</span>
          <span className="flex items-center gap-1.5"><UsersRound className="size-4 text-secondary" aria-hidden="true" />Same campus or nearby</span>
          <span className="flex items-center gap-1.5"><Leaf className="size-4 text-secondary" aria-hidden="true" />A more sustainable campus</span>
        </div>
      </div>

      <div className="relative hidden min-h-[30rem] lg:block">
        <Image
          src="/marketplace-hero.webp"
          alt="Textbooks, headphones, laptop and study essentials in a student residence"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-control bg-white/95 px-3 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          <MapPin className="size-4 text-primary" aria-hidden="true" />
          Browse listings near your campus
        </div>
      </div>
    </section>
  );
}
