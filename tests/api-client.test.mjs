import assert from "node:assert/strict";
import { test } from "node:test";

import { loadTypeScript } from "./load-typescript.mjs";

function client(fetch, overrides = {}) {
  const window = new EventTarget();
  return {
    api: loadTypeScript("src/lib/api.ts", { fetch, window, ...overrides }),
    window,
  };
}

test("API requests use same-origin cookies, bypass caches, and keep auth options out of fetch", async () => {
  let request;
  const { api } = client(async (url, init) => {
    request = { url, init };
    return Response.json({ data: { id: "order" } });
  });
  const controller = new AbortController();
  const result = await api.apiRequest("/orders", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ quantity: 2 }),
    headers: { "x-request-id": "checkout" },
    signal: controller.signal,
    credentials: "omit",
    cache: "force-cache",
  });

  assert.deepEqual(result, { id: "order" });
  assert.equal(request.url, "/api/marketplace/orders");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.body, '{"quantity":2}');
  assert.equal(request.init.headers.get("content-type"), "application/json");
  assert.equal(request.init.headers.get("x-marketplace-auth"), "required");
  assert.equal(request.init.headers.get("x-request-id"), "checkout");
  assert.equal(request.init.credentials, "same-origin");
  assert.equal(request.init.cache, "no-store");
  assert.equal(request.init.signal, controller.signal);
  assert.equal(Object.hasOwn(request.init, "auth"), false);
});

test("public reads do not request authentication or a JSON content type", async () => {
  const { api } = client(async (url, init) => {
    assert.equal(url, "/api/marketplace/products?limit=2");
    assert.equal(init.headers.has("x-marketplace-auth"), false);
    assert.equal(init.headers.has("content-type"), false);
    return Response.json({ data: ["product"] });
  });

  assert.deepEqual(await api.apiPublic("/products?limit=2"), ["product"]);
});

test("multipart uploads preserve FormData so fetch can supply its boundary", async () => {
  const form = new FormData();
  form.set("description", "Student ID");
  const { api } = client(async (_url, init) => {
    assert.equal(init.body, form);
    assert.equal(init.headers.has("content-type"), false);
    assert.equal(init.headers.get("x-marketplace-auth"), "required");
    return Response.json({ data: { uploaded: true } });
  });

  assert.deepEqual(
    await api.apiRequest("/verification", {
      method: "POST",
      auth: true,
      body: form,
    }),
    { uploaded: true },
  );
});

test("an explicit request content type is preserved", async () => {
  const headers = new Headers({ "Content-Type": "text/plain" });
  const { api } = client(async (_url, init) => {
    assert.equal(init.headers.get("content-type"), "text/plain");
    return new Response(null, { status: 204 });
  });

  assert.equal(
    await api.apiRequest("/notes", { method: "POST", headers, body: "hello" }),
    undefined,
  );
  assert.equal(headers.has("x-marketplace-auth"), false);
});

test("structured API errors retain their status, code, message and field details", async () => {
  const details = [{ field: "quantity", message: "Insufficient stock." }];
  const { api } = client(async () =>
    Response.json(
      { error: { code: "ORDER_STOCK", message: "Order failed.", details } },
      { status: 409 },
    ),
  );

  await assert.rejects(api.apiRequest("/orders"), (error) => {
    assert.ok(error instanceof api.ApiClientError);
    assert.equal(error.status, 409);
    assert.equal(error.code, "ORDER_STOCK");
    assert.equal(error.message, "Order failed.");
    assert.deepEqual(error.details, details);
    return true;
  });
});

for (const [name, body] of [
  ["non-JSON", "<html>Unavailable</html>"],
  ["missing-error", JSON.stringify({})],
  ["empty", null],
]) {
  test(`${name} error responses become usable API errors`, async () => {
    const { api } = client(async () => new Response(body, { status: 502 }));

    await assert.rejects(api.apiPublic("/products"), (error) => {
      assert.ok(error instanceof api.ApiClientError);
      assert.equal(error.status, 502);
      assert.equal(error.code, "REQUEST_FAILED");
      assert.equal(error.message, "Request failed.");
      assert.equal(error.details, undefined);
      return true;
    });
  });
}

test("paginated requests preserve both items and pagination metadata", async () => {
  const data = [{ id: "product" }];
  const meta = { page: 2, limit: 1, total: 3, totalPages: 3 };
  const { api } = client(async () => Response.json({ data, meta }));

  const result = await api.apiPage("/products?page=2");

  assert.deepEqual(result.data, data);
  assert.deepEqual(result.meta, meta);
});

test("paginated requests fail explicitly when the server omits metadata", async () => {
  const { api } = client(async () => Response.json({ data: [] }));

  await assert.rejects(api.apiPage("/products"), (error) => {
    assert.ok(error instanceof api.ApiClientError);
    assert.equal(error.status, 502);
    assert.equal(error.code, "PAGINATION_MISSING");
    return true;
  });
});

test("a protected 401 clears an established session and notifies consumers once", async () => {
  const { api, window } = client(async (url) =>
    url.endsWith("/auth/me")
      ? Response.json({ data: { user: { id: "buyer" } } })
      : Response.json(
          { error: { code: "AUTH_TOKEN_INVALID" } },
          { status: 401 },
        ),
  );
  await api.getCurrentAuth();
  let changes = 0;
  window.addEventListener("marketplace-auth", () => changes++);

  await assert.rejects(api.apiRequest("/orders", { auth: true }));

  assert.equal(api.getStoredAuth(), null);
  assert.equal(await api.getCurrentAuth(), null);
  assert.equal(changes, 1);
});

for (const [status, auth] of [
  [401, false],
  [403, true],
  [503, true],
]) {
  test(`a ${status} response with auth=${auth} preserves an established session`, async () => {
    const { api, window } = client(async (url) =>
      url.endsWith("/auth/me")
        ? Response.json({ data: { user: { id: "buyer" } } })
        : Response.json({ error: { code: "REQUEST_FAILED" } }, { status }),
    );
    const session = await api.getCurrentAuth();
    let changes = 0;
    window.addEventListener("marketplace-auth", () => changes++);

    await assert.rejects(api.apiRequest("/products", { auth }));

    assert.equal(api.getStoredAuth(), session);
    assert.equal(changes, 0);
  });
}

test("error messages distinguish expired sessions from incorrect credentials", () => {
  const { api } = client(async () => {
    throw new Error("No request expected");
  });

  assert.equal(
    api.apiErrorMessage(
      new api.ApiClientError(401, "AUTH_TOKEN_INVALID", "Token expired"),
    ),
    api.SESSION_ERROR_MESSAGE,
  );
  assert.equal(
    api.apiErrorMessage(
      new api.ApiClientError(401, "AUTH_CREDENTIALS_INVALID", "Wrong password"),
    ),
    "Wrong password",
  );
});

test("validation messages include valid field errors and ignore malformed details", () => {
  const { api } = client(async () => {});
  const error = new api.ApiClientError(
    400,
    "VALIDATION_ERROR",
    "Invalid input.",
    [
      null,
      "invalid",
      { field: "quantity", message: "Must be positive." },
      { field: "email", message: "Required." },
      { field: "name" },
      { field: 12, message: "invalid" },
    ],
  );

  assert.equal(
    api.apiErrorMessage(error),
    "Invalid input. quantity: Must be positive.; email: Required.",
  );
  assert.equal(
    api.apiErrorMessage(
      new api.ApiClientError(400, "INVALID", "Invalid.", [null]),
    ),
    "Invalid.",
  );
  assert.equal(
    api.apiErrorMessage(new Error("private connection detail")),
    "Unable to reach the marketplace service. Please try again.",
  );
});

test("password recovery uses its bearer token without requiring a cookie session", async () => {
  const { api } = client(async (url, init) => {
    assert.equal(url, "/api/marketplace/auth/reset-password");
    assert.equal(init.method, "POST");
    assert.equal(init.headers.get("authorization"), "Bearer recovery-token");
    assert.equal(init.headers.has("x-marketplace-auth"), false);
    assert.deepEqual(JSON.parse(init.body), {
      password: "UpdatedPassword123!",
    });
    return new Response(null, { status: 204 });
  });

  assert.equal(
    await api.resetPassword("UpdatedPassword123!", "recovery-token"),
    undefined,
  );
});

test("legacy session cleanup removes only the legacy key from both browser stores", () => {
  const localStorage = new Map([
    ["marketplace.session", "old access token"],
    ["marketplace-basket:buyer", "saved basket"],
  ]);
  const sessionStorage = new Map([
    ["marketplace.session", "old refresh token"],
  ]);
  const { api } = client(async () => {}, {
    window: {
      localStorage: { removeItem: (key) => localStorage.delete(key) },
      sessionStorage: { removeItem: (key) => sessionStorage.delete(key) },
    },
  });

  api.clearLegacyBrowserSession();

  assert.equal(localStorage.has("marketplace.session"), false);
  assert.equal(sessionStorage.has("marketplace.session"), false);
  assert.equal(localStorage.get("marketplace-basket:buyer"), "saved basket");
});

test("legacy session cleanup tolerates disabled browser storage and server rendering", () => {
  const { api } = client(async () => {}, {
    window: {
      get localStorage() {
        throw new Error("Storage disabled");
      },
    },
  });

  assert.doesNotThrow(() => api.clearLegacyBrowserSession());
  assert.doesNotThrow(() =>
    loadTypeScript("src/lib/api.ts").clearLegacyBrowserSession(),
  );
});
