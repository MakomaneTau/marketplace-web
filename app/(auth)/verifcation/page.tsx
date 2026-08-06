import Link from "next/link";

import {
  GraduationCap,
} from "lucide-react";

import { SellerVerificationForm } from "@/app/components/verification/SellerVerificationForm";

export default function SellerVerificationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Small top bar */}

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
            px-4
            sm:px-6
          "
        >
          <Link
            href="/"
            className="
              ml-3
              text-lg
              font-bold
              text-primary
            "
          >
            Marketplace
          </Link>
        </div>
      </header>

      {/* Page */}

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
        {/* Heading */}

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
            Verify your vendor status
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
            We need two photos to verify your
            vendor account before you can use
            student marketplace features.
          </p>
        </div>

        <SellerVerificationForm />
      </main>
    </div>
  );
}