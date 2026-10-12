import assert from "node:assert/strict";
import { test } from "node:test";

import { NextRequest } from "next/server.js";

import { loadTypeScript } from "./load-typescript.mjs";

const entry = "app/api/marketplace/[...path]/route.ts";
const context = (path) => ({
  params: Promise.resolve({ path: path.split("/") }),
});
const session = {
  accessToken: "access",
  refreshToken: "refresh",
  expiresIn: 3600,
  expiresAt: 10000,
  tokenType: "bearer",
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

test("gateway forwards query, authorization, and cache policy", async () => {
  let upstream;
  const route = loadTypeScript(entry, {
    fetch: async (url, init) => {
      upstream = { url, init };
      return json({ data: [] });
    },
  });
  const response = await route.GET(
    new NextRequest("http://localhost:3000/api/marketplace/products?limit=8", {
      headers: { cookie: "marketplace-access=access" },
    }),
    context("products"),
  );
  assert.equal(response.status, 200);
  assert.equal(upstream.url, "http://127.0.0.1:4000/api/v1/products?limit=8");
  assert.equal(upstream.init.headers.get("authorization"), "Bearer access");
  assert.equal(upstream.init.cache, "no-store");
  assert.ok(upstream.init.signal instanceof AbortSignal);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("login sets HttpOnly cookies and removes tokens from the browser response", async () => {
  const route = loadTypeScript(entry, {
    fetch: async () => json({ data: { user: { id: "user" }, session } }),
  });
  const response = await route.POST(
    new NextRequest("http://localhost:3000/api/marketplace/auth/login", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
        "content-type": "application/json",
        "x-marketplace-persistent": "true",
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "Password123!",
      }),
    }),
    context("auth/login"),
  );
  assert.deepEqual(await response.json(), { data: { user: { id: "user" } } });
  assert.equal(response.cookies.get("marketplace-access").value, "access");
  assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(response.headers.get("set-cookie"), /Max-Age=3600/i);
});

test("unsafe cross-origin requests are rejected before reaching upstream", async () => {
  const route = loadTypeScript(entry, {
    fetch: async () => {
      throw new Error("Upstream should not run");
    },
  });
  const response = await route.POST(
    new NextRequest("http://localhost:3000/api/marketplace/auth/login", {
      method: "POST",
      headers: { host: "localhost:3000", origin: "https://another.example" },
    }),
    context("auth/login"),
  );
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, "ORIGIN_NOT_ALLOWED");
});

test("gateway refreshes expired access and retries the protected request once", async () => {
  const calls = [];
  const route = loadTypeScript(entry, {
    fetch: async (url, init) => {
      calls.push({ url, init });
      if (url.endsWith("/auth/refresh")) return json({ data: { session } });
      return calls.length === 1
        ? json({ error: { code: "AUTH_TOKEN_INVALID" } }, 401)
        : json({ data: { id: "user" } });
    },
  });
  const response = await route.GET(
    new NextRequest("http://localhost:3000/api/marketplace/profile", {
      headers: {
        cookie: "marketplace-access=expired; marketplace-refresh=refresh",
        "x-marketplace-auth": "required",
      },
    }),
    context("profile"),
  );
  assert.equal(response.status, 200);
  assert.equal(calls.length, 3);
  assert.equal(calls[2].init.headers.get("authorization"), "Bearer access");
  assert.equal(response.cookies.get("marketplace-access").value, "access");
});

test("gateway returns a safe 503 when the upstream connection fails", async () => {
  const route = loadTypeScript(entry, {
    fetch: async () => {
      throw new Error("private implementation detail");
    },
  });
  const response = await route.GET(
    new NextRequest("http://localhost:3000/api/marketplace/products"),
    context("products"),
  );
  assert.equal(response.status, 503);
  const body = await response.text();
  assert.match(body, /MARKETPLACE_SERVICE_UNAVAILABLE/);
  assert.doesNotMatch(body, /private implementation detail/);
});

test("a rejected protected session clears its cookies", async () => {
  const route = loadTypeScript(entry, {
    fetch: async () => json({ error: { code: "AUTH_TOKEN_INVALID" } }, 401),
  });
  const response = await route.GET(
    new NextRequest("http://localhost:3000/api/marketplace/profile", {
      headers: {
        cookie: "marketplace-access=expired",
        "x-marketplace-auth": "required",
      },
    }),
    context("profile"),
  );
  assert.equal(response.status, 401);
  assert.equal(response.cookies.get("marketplace-access").value, "");
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
});

test("the protected-page proxy keeps buyers out of seller pages", async () => {
  const { proxy } = loadTypeScript("proxy.ts", {
    fetch: async () => json({ data: { profile: { role: "buyer" } } }),
  });
  const response = await proxy(
    new NextRequest("http://localhost:3000/seller", {
      headers: { cookie: "marketplace-access=access" },
    }),
  );
  assert.match(response.headers.get("location"), /reason=seller_required/);
});

test("the protected-page proxy requires explicit admin membership", async () => {
  const { proxy } = loadTypeScript("proxy.ts", {
    fetch: async () =>
      json({ data: { profile: { role: "seller", isAdmin: false } } }),
  });
  const response = await proxy(
    new NextRequest("http://localhost:3000/admin", {
      headers: { cookie: "marketplace-access=access" },
    }),
  );
  assert.match(response.headers.get("location"), /reason=admin_required/);
});
