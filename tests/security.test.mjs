import assert from "node:assert/strict";
import { test } from "node:test";

import { NextRequest } from "next/server.js";

import { loadTypeScript } from "./load-typescript.mjs";

const entry = "app/api/marketplace/[...path]/route.ts";
const context = (path = ["auth", "login"]) => ({
  params: Promise.resolve({ path }),
});
const origin = "http://localhost:3000";
function request(headers = {}, body) {
  return new NextRequest(`${origin}/api/marketplace/auth/login`, {
    method: "POST",
    headers,
    body,
  });
}

test("cookie writes fail closed for absent, opaque, cross-site and sibling origins", async () => {
  let calls = 0;
  const route = loadTypeScript(entry, {
    fetch: async () => {
      calls++;
      return Response.json({ data: {} });
    },
  });
  for (const headers of [
    {},
    { origin: "null" },
    { origin: "https://evil.example" },
    { origin, "sec-fetch-site": "cross-site" },
    { origin, "sec-fetch-site": "same-site" },
    { referer: "https://evil.example/form" },
    { authorization: "Bearer token" },
  ]) {
    const response = await route.POST(
      request({ cookie: "marketplace-access=secret", ...headers }),
      context(),
    );
    assert.equal(response.status, 403, JSON.stringify(headers));
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
  assert.equal(calls, 0);
});

test("same-origin browser writes and standalone bearer clients remain usable", async () => {
  const route = loadTypeScript(entry, {
    fetch: async () => Response.json({ data: {} }),
  });
  for (const headers of [
    { origin },
    { "sec-fetch-site": "same-origin" },
    { referer: `${origin}/login` },
    { authorization: "Bearer token" },
  ]) {
    const response = await route.POST(request(headers), context());
    assert.equal(response.status, 200);
  }
});

test("configured public origin is authoritative behind a reverse proxy", async () => {
  const route = loadTypeScript(entry, {
    process: {
      env: { NODE_ENV: "production", APP_ORIGIN: "https://market.example" },
    },
    fetch: async () => Response.json({ data: {} }),
  });
  assert.equal(
    (await route.POST(request({ origin: "https://market.example" }), context()))
      .status,
    200,
  );
  assert.equal((await route.POST(request({ origin }), context())).status, 403);
});

test("oversized bodies are rejected with and without Content-Length before forwarding", async () => {
  let calls = 0;
  const route = loadTypeScript(entry, {
    fetch: async () => {
      calls++;
      return Response.json({ data: {} });
    },
  });
  const cases = [
    request({ origin, "content-length": "1048577" }),
    request(
      { origin, "content-type": "application/json" },
      "x".repeat(1048577),
    ),
    request(
      { origin, "content-type": "application/json", "content-length": "1" },
      "x".repeat(1048577),
    ),
    request({
      origin,
      "content-type": "multipart/form-data; boundary=x",
      "content-length": String(12 * 1024 * 1024),
    }),
  ];
  for (const req of cases) {
    const response = await route.POST(req, context());
    assert.equal(response.status, 413);
    assert.equal((await response.json()).error.code, "REQUEST_TOO_LARGE");
  }
  assert.equal(calls, 0);
});

test("valid JSON and bounded multipart bodies survive byte-for-byte", async () => {
  let forwarded;
  const route = loadTypeScript(entry, {
    fetch: async (_url, init) => {
      forwarded = new Uint8Array(init.body);
      return Response.json({ data: {} });
    },
  });
  for (const [type, value] of [
    ["application/json", '{"message":"hello"}'],
    ["multipart/form-data; boundary=test", "--test\r\nimage bytes\r\n--test--"],
  ]) {
    const response = await route.POST(
      request({ origin, "content-type": type }, value),
      context(),
    );
    assert.equal(response.status, 200);
    assert.equal(new TextDecoder().decode(forwarded), value);
  }
});

test("compressed bodies and API traversal never reach upstream", async () => {
  let calls = 0;
  const route = loadTypeScript(entry, {
    fetch: async () => {
      calls++;
      return Response.json({ data: {} });
    },
  });
  assert.equal(
    (
      await route.POST(
        request({ origin, "content-encoding": "gzip" }, "compressed"),
        context(),
      )
    ).status,
    415,
  );
  for (const path of [
    ["..", "admin"],
    ["%2e%2e", "admin"],
    ["auth/login"],
    ["auth\\login"],
    ["."],
  ]) {
    assert.equal(
      (await route.POST(request({ origin }), context(path))).status,
      400,
    );
  }
  assert.equal(calls, 0);
});

test("page CSP uses fresh nonces, overwrites injected headers and blocks inline script", async () => {
  const { proxy } = loadTypeScript("proxy.ts", {
    process: { env: { NODE_ENV: "production" } },
  });
  const policies = [];
  for (let i = 0; i < 2; i++) {
    const response = await proxy(
      new NextRequest(`${origin}/login`, {
        headers: {
          "x-nonce": "attacker",
          "content-security-policy": "script-src * 'unsafe-inline'",
        },
      }),
    );
    const policy = response.headers.get("content-security-policy");
    const scripts = policy
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("script-src "));
    assert.match(scripts, /'nonce-[A-Za-z0-9+/=]+'/);
    assert.doesNotMatch(scripts, /unsafe-inline|unsafe-eval|attacker/);
    assert.match(policy, /script-src-attr 'none'/);
    assert.match(policy, /frame-ancestors 'none'/);
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.equal(
      response.headers.get("x-middleware-request-content-security-policy"),
      policy,
    );
    policies.push(policy);
  }
  assert.notEqual(policies[0], policies[1]);
});
