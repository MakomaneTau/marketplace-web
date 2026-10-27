import assert from "node:assert/strict";
import { test } from "node:test";

import { NextResponse } from "next/server.js";

import { loadTypeScript } from "./load-typescript.mjs";

const entry = "src/lib/server/session-cookies.ts";
const cookieNames = [
  "marketplace-access",
  "marketplace-refresh",
  "marketplace-persistent",
];
const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresIn: 3600,
  expiresAt: 10000,
  tokenType: "bearer",
};
const thirtyDays = 30 * 24 * 60 * 60;

for (const environment of ["development", "production"]) {
  for (const persistent of [false, true]) {
    test(`${environment} ${persistent ? "remembered" : "browser-only"} sessions serialize the required cookie protections and lifetimes`, () => {
      const { setSessionCookies } = loadTypeScript(entry, {
        process: { env: { NODE_ENV: environment } },
      });
      const response = NextResponse.json({ authenticated: true });

      setSessionCookies(response, session, persistent);

      assert.equal(response.cookies.getAll().length, 3);
      const expectedValues = [
        "access-token",
        "refresh-token",
        String(persistent),
      ];
      for (const [index, name] of cookieNames.entries()) {
        const cookie = response.cookies.get(name);
        assert.equal(cookie.value, expectedValues[index]);
        assert.equal(cookie.httpOnly, true);
        assert.equal(cookie.secure, environment === "production");
        assert.equal(cookie.sameSite, "lax");
        assert.equal(cookie.path, "/");
        assert.equal(cookie.domain, undefined);
        assert.equal(
          cookie.maxAge,
          persistent ? (index === 0 ? 3600 : thirtyDays) : undefined,
        );
        assert.equal(cookie.expires !== undefined, persistent);
      }
      const serialized = response.headers.get("set-cookie");
      assert.match(serialized, /HttpOnly/);
      assert.match(serialized, /SameSite=lax/);
      if (environment === "production") assert.match(serialized, /Secure/);
      else assert.doesNotMatch(serialized, /Secure/);
      if (!persistent) assert.doesNotMatch(serialized, /Max-Age|Expires/);
    });
  }

  test(`clearing a ${environment} remembered session expires all authentication cookies at their original scope`, () => {
    const { setSessionCookies, clearSessionCookies } = loadTypeScript(entry, {
      process: { env: { NODE_ENV: environment } },
    });
    const response = NextResponse.json({ authenticated: false });
    response.cookies.set("theme", "dark");
    setSessionCookies(response, session, true);

    clearSessionCookies(response);
    clearSessionCookies(response);

    assert.equal(response.cookies.getAll().length, 4);
    assert.equal(response.cookies.get("theme").value, "dark");
    for (const name of cookieNames) {
      const cookie = response.cookies.get(name);
      assert.equal(cookie.value, "");
      assert.equal(cookie.maxAge, 0);
      assert.equal(cookie.path, "/");
      assert.equal(cookie.httpOnly, true);
      assert.equal(cookie.sameSite, "lax");
      assert.equal(cookie.secure, environment === "production");
    }
    assert.doesNotMatch(
      response.headers.get("set-cookie"),
      /access-token|refresh-token/,
    );
  });
}

for (const expiresIn of [0, -120]) {
  test(`a remembered session with expiresIn=${expiresIn} keeps a minimum one-second access cookie without shortening refresh expiry`, () => {
    const { setSessionCookies } = loadTypeScript(entry);
    const response = NextResponse.json({});

    setSessionCookies(response, { ...session, expiresIn }, true);

    assert.equal(response.cookies.get("marketplace-access").maxAge, 1);
    assert.equal(
      response.cookies.get("marketplace-refresh").maxAge,
      thirtyDays,
    );
    assert.equal(
      response.cookies.get("marketplace-persistent").maxAge,
      thirtyDays,
    );
  });
}

test("switching from a remembered session to a browser-only session replaces tokens and removes persistent expiry", () => {
  const { setSessionCookies } = loadTypeScript(entry);
  const response = NextResponse.json({});
  setSessionCookies(response, session, true);

  setSessionCookies(
    response,
    { ...session, accessToken: "new-access", refreshToken: "new-refresh" },
    false,
  );

  assert.equal(response.cookies.getAll().length, 3);
  assert.equal(response.cookies.get("marketplace-access").value, "new-access");
  assert.equal(
    response.cookies.get("marketplace-refresh").value,
    "new-refresh",
  );
  assert.equal(response.cookies.get("marketplace-persistent").value, "false");
  for (const name of cookieNames) {
    assert.equal(response.cookies.get(name).maxAge, undefined);
    assert.equal(response.cookies.get(name).expires, undefined);
  }
  assert.doesNotMatch(
    response.headers.get("set-cookie"),
    /Max-Age|Expires|access-token|refresh-token/,
  );
});
