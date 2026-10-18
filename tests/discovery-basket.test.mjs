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
