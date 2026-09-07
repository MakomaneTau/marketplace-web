"use client";

import { useEffect, useState } from "react";

import {
  getCurrentAuth,
  getStoredAuth,
  type StoredAuth,
} from "@/app/libs/api";

export function useAuth() {
  const [auth, setAuth] = useState<StoredAuth | null>(getStoredAuth());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = () => {
      setReady(false);
      getCurrentAuth(true)
        .then((nextAuth) => {
          if (active) setAuth(nextAuth);
        })
        .catch(() => {
          if (active) setAuth(null);
        })
        .finally(() => {
          if (active) setReady(true);
        });
    };

    sync();
    window.addEventListener("marketplace-auth", sync);
    return () => {
      active = false;
      window.removeEventListener("marketplace-auth", sync);
    };
  }, []);

  return { auth, ready };
}
