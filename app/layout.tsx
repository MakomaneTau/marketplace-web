import type { Metadata } from "next";

import { SessionBootstrap } from "@/app/components/auth/session-bootstrap";

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

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <SessionBootstrap>{children}</SessionBootstrap>
      </body>
    </html>
  );
}
