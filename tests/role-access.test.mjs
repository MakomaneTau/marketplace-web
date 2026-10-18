import assert from "node:assert/strict";
import { test } from "node:test";

import { loadTypeScript } from "./load-typescript.mjs";

const { roleRedirect, loginDestination } = loadTypeScript(
  "src/lib/role-access.ts",
);

test("restored buyer pages redirect sellers and admins while keeping public and buyer access", () => {
  for (const path of [
    "/",
    "/cart",
    "/shops/campus-books",
    "/orders",
    "/favourites",
    "/messages",
    "/products/123",
    "/search",
    "/categories/books",
  ]) {
    assert.equal(roleRedirect({ role: "seller" }, path), "/seller");
    assert.equal(
      roleRedirect({ role: "buyer", isAdmin: true }, path),
      "/admin",
    );
    assert.equal(
      roleRedirect({ role: "seller", isAdmin: true }, path),
      "/admin",
    );
    assert.equal(roleRedirect({ role: "buyer" }, path), null);
    assert.equal(roleRedirect(null, path), null);
  }
  assert.equal(roleRedirect({ role: "seller" }, "/seller/messages"), null);
  assert.equal(roleRedirect({ role: "seller" }, "/privacy"), null);
});

test("login destinations respect role permissions and reject external redirects", () => {
  assert.equal(
    loginDestination({ role: "seller" }, "/cart?product=123"),
    "/seller",
  );
  assert.equal(
    loginDestination({ role: "buyer", isAdmin: true }, "/"),
    "/admin",
  );
  assert.equal(loginDestination({ role: "buyer" }, "/seller"), "/");
  assert.equal(loginDestination({ role: "buyer" }, "//evil.example"), "/");
  assert.equal(
    loginDestination({ role: "buyer" }, "/cart?product=123"),
    "/cart?product=123",
  );
});
