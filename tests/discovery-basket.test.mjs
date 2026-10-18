import assert from "node:assert/strict";
import { test } from "node:test";

import { loadTypeScript } from "./load-typescript.mjs";

const { parseSearch, searchParams, priceError } = loadTypeScript(
  "src/components/search/search-model.ts",
  { URLSearchParams },
);
test("shared search URLs preserve campus, fulfilment, budgets and pages, including legacy condition labels", () => {
  const filters = parseSearch(
    new URLSearchParams(
      "condition=Like+New&sort=price-low&campus=abc&min_price=50&max_price=200&fulfilment=campus_pickup&page=3",
    ),
  );
  assert.equal(filters.condition, "like_new");
  assert.equal(filters.sort, "price_asc");
  assert.equal(filters.page, 3);
  assert.equal(
    JSON.stringify(parseSearch(searchParams(filters))),
    JSON.stringify(filters),
  );
  assert.equal(priceError(filters), null);
  assert.ok(priceError({ ...filters, min_price: "201" }));
  assert.ok(priceError({ ...filters, max_price: "NaN" }));
  assert.equal(parseSearch(new URLSearchParams("page=-2")).page, 1);
});
test("basket survives reload, isolates accounts and rejects malformed persisted entries", () => {
  const storage = new Map();
  const overrides = {
    localStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
    },
    window: { dispatchEvent() {} },
  };
  let basket = loadTypeScript(
    "src/components/checkout/basket-store.ts",
    overrides,
  );
  const id = "90000000-0000-4000-8000-000000000005";
  basket.addToBasket("buyer-a", id);
  basket.addToBasket("buyer-a", id);
  basket = loadTypeScript("src/components/checkout/basket-store.ts", overrides);
  assert.equal(basket.readBasket("buyer-a")[0].quantity, 2);
  assert.equal(basket.readBasket("buyer-b").length, 0);
  storage.set(
    "marketplace-basket:buyer-a",
    JSON.stringify([
      { productId: id, quantity: -1 },
      { productId: "bad", quantity: 2 },
    ]),
  );
  assert.equal(basket.readBasket("buyer-a").length, 0);
  storage.set("marketplace-basket:buyer-a", "not JSON");
  assert.equal(basket.readBasket("buyer-a").length, 0);
});
