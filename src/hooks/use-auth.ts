"use client";

import { createContext, useContext } from "react";

import { type StoredAuth } from "@/lib/api";

export const AuthContext = createContext<{
  auth: StoredAuth | null;
  ready: boolean;
}>({ auth: null, ready: false });

export function useAuth() {
  return useContext(AuthContext);
}
