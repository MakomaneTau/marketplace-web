import type { ReactNode } from "react";

import { SellerShell } from "@/components/seller/seller-shell";

export default function SellerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="seller-theme min-h-screen bg-background text-foreground">
      <SellerShell>{children}</SellerShell>
    </div>
  );
}
