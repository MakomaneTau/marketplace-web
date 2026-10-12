import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { SellerVerificationForm } from "@/components/verification/SellerVerificationForm";

export default function SellerVerificationPage() {
  return (
    <div className="min-h-screen bg-background">
      <header
        className="
          border-b
          border-border
          bg-surface
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-full
            max-w-2xl
            items-center
            justify-between
            px-4
            sm:px-6
          "
        >
          <Link
            href="/"
            className="
              text-lg
              font-bold
              text-primary
            "
          >
            Marketplace
          </Link>
          <Link
            href="/seller"
            className="inline-flex items-center gap-2 rounded-card border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Seller centre
          </Link>
        </div>
      </header>

      <main
        className="
          mx-auto
          w-full
          max-w-2xl
          px-4
          py-8
          sm:px-6
          md:py-12
        "
      >
        <div className="mb-8">
          <div
            className="
              mb-4
              flex
              size-12
              items-center
              justify-center
              rounded-card
              bg-primary-soft
              text-primary
            "
          >
            <GraduationCap className="size-6" />
          </div>

          <h1
            className="
              text-2xl
              font-bold
              text-foreground
              sm:text-3xl
            "
          >
            Verify your seller account
          </h1>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-muted
              sm:text-base
            "
          >
            You can set up your shop and sell for seven days after sign-up.
            After that, an admin must approve your verification before you can
            keep selling. Submit your photos now to avoid an interruption.
          </p>
          <Link
            href="/seller"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Continue setting up shop
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <SellerVerificationForm />
      </main>
    </div>
  );
}
