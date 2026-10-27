import assert from "node:assert/strict";
import { test } from "node:test";

import { loadTypeScript } from "./load-typescript.mjs";

const { contentSecurityPolicy } = loadTypeScript(
  "src/lib/server/security-policy.ts",
);

function directives(production, nonce = "test-nonce+base64=") {
  return new Map(
    contentSecurityPolicy(nonce, production)
      .split(";")
      .map((part) => {
        const [name, ...sources] = part.trim().split(/\s+/);
        return [name, sources];
      }),
  );
}

test("production scripts require the supplied nonce and exclude inline scripts and eval", () => {
  const policy = directives(true);
  const scripts = policy.get("script-src");

  assert.ok(scripts.includes("'nonce-test-nonce+base64='"));
  assert.ok(scripts.includes("'strict-dynamic'"));
  assert.ok(scripts.includes("'self'"));
  assert.ok(!scripts.includes("'unsafe-inline'"));
  assert.ok(!scripts.includes("'unsafe-eval'"));
  assert.deepEqual(policy.get("script-src-attr"), ["'none'"]);
  assert.ok(policy.has("upgrade-insecure-requests"));
});

test("production image and connection sources exclude local development services", () => {
  const policy = directives(true);

  assert.deepEqual(policy.get("connect-src"), ["'self'"]);
  const images = policy.get("img-src");
  for (const source of [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    "https://*.supabase.co",
  ]) {
    assert.ok(images.includes(source), source);
  }
  assert.ok(!images.some((source) => source.startsWith("http:")));
  assert.ok(!images.includes("*"));
});

test("development enables eval, local image storage, and hot-reload sockets without relaxing script attributes", () => {
  const policy = directives(false);

  assert.ok(policy.get("script-src").includes("'unsafe-eval'"));
  assert.ok(!policy.get("script-src").includes("'unsafe-inline'"));
  assert.deepEqual(policy.get("script-src-attr"), ["'none'"]);
  for (const origin of ["http://127.0.0.1:55321", "http://localhost:55321"]) {
    assert.ok(policy.get("img-src").includes(origin));
  }
  assert.deepEqual(policy.get("connect-src"), [
    "'self'",
    "ws://localhost:*",
    "ws://127.0.0.1:*",
  ]);
  assert.ok(!policy.has("upgrade-insecure-requests"));
});

for (const production of [false, true]) {
  test(`${production ? "production" : "development"} blocks plugins, framing, base URL overrides, and off-site form submissions`, () => {
    const policy = directives(production);

    for (const directive of ["object-src", "frame-ancestors", "base-uri"]) {
      assert.deepEqual(policy.get(directive), ["'none'"], directive);
    }
    assert.deepEqual(policy.get("default-src"), ["'self'"]);
    assert.deepEqual(policy.get("form-action"), ["'self'"]);
  });
}
