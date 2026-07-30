import React from "react";
import { Header } from "@/app/components/layout/Header";
import { Footer } from "@/app/components/layout/Footer";

export function AppShell() {
  return (
  <main className="flex min-h-screen flex-col">
    <Header />

    <Footer />
  </main>
  );
}
