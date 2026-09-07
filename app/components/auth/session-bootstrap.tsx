"use client";

import { useEffect } from "react";

import { clearLegacyBrowserSession } from "@/app/libs/api";

export function SessionBootstrap() {
  useEffect(() => {
    clearLegacyBrowserSession();
  }, []);
  return null;
}
