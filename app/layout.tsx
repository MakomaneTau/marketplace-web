import type { Metadata } from "next";
import { connection } from "next/server";

import { SessionBootstrap } from "@/components/auth/session-bootstrap";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Marketplace",
    template: "%s | Marketplace",
  },
  description: "A marketplace built for South African students.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  // CSP nonces must be generated at request time, never baked into cached HTML.
  await connection();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <SessionBootstrap>{children}</SessionBootstrap>
      </body>
    </html>
  );
}
