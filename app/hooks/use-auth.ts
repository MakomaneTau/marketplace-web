"use client";

import { createContext, useContext } from "react";

import {
  type StoredAuth,
} from "@/app/libs/api";

export const AuthContext = createContext<{ auth: StoredAuth | null; ready: boolean }>({ auth: null, ready: false });

export function useAuth() { return useContext(AuthContext); }
