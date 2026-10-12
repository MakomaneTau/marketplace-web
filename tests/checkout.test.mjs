import assert from "node:assert/strict";
import { test } from "node:test";

import { loadTypeScript } from "./load-typescript.mjs";

test("checkout bounds quantity and sends trimmed, bounded pickup notes", () => {
  const model = loadTypeScript("src/components/checkout/checkout-model.ts");
  assert.equal(model.maximumOrderQuantity({ stock_quantity: 2 }), 2);
  assert.equal(model.maximumOrderQuantity({ stock_quantity: 1000 }), 99);
  const form = new FormData();
  assert.equal(model.buildPickupNotes(form), null);
  form.set("preferredBuilding", " Library ");
  form.set("preferredTime", "09:30");
  assert.equal(
    model.buildPickupNotes(form),
    "Preferred building: Library\nPreferred time: 09:30",
  );
  form.set("otherPickupDetails", "x".repeat(600));
  assert.equal(model.buildPickupNotes(form).length, 500);
});

test("checkout preserves the product when pickup-campus loading fails", async () => {
  const product = {
    id: "product",
    allows_campus_pickup: true,
    shop: { slug: "shop" },
  };
  const model = loadTypeScript("src/components/checkout/checkout-model.ts", {
    fetch: async (url) =>
      url.includes("/shops/")
        ? new Response(
            JSON.stringify({
              error: {
                code: "SHOP_SERVICE_UNAVAILABLE",
                message: "Try again.",
              },
            }),
            { status: 503 },
          )
        : new Response(JSON.stringify({ data: product })),
  });
  const result = await model.fetchCheckoutData("product");
  assert.deepEqual(result.item, product);
  assert.equal(result.campuses.length, 0);
  assert.equal(result.campusError, "Try again.");
});
