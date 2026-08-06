import type { ReactNode } from "react";
import { SellerShell } from "@/app/components/seller/seller-shell";

export default function SellerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SellerShell>{children}</SellerShell>;
}
