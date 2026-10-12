import type { ReactNode } from "react";

import { SellerShell } from "@/components/seller/seller-shell";

export default function SellerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <SellerShell>{children}</SellerShell>;
}
