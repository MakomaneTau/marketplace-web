import { describe, expect, it } from "vitest";

import {
  buildPickupNotes,
  PICKUP_TIME_OPTIONS,
} from "@/components/checkout/checkout-model";
import {
  parseSearch,
  priceError,
  searchParams,
} from "@/components/search/search-model";

describe("search filters", () => {
  it.each(["-1", "1.5", "NaN", "Infinity", "1e3", "", "not-a-number"])(
    "defaults malformed page %j to page one",
    (page) => {
      expect(parseSearch(new URLSearchParams({ page })).page).toBe(1);
    },
  );

  it("bounds excessive page numbers and drops unsupported filters", () => {
    const filters = parseSearch(
      new URLSearchParams({
        page: "99999999999999999999",
        sort: "random",
        condition: "broken",
        fulfilment: "teleport",
        collection: "private",
      }),
    );
    expect(filters).toMatchObject({
      page: 1_000_000,
      sort: "newest",
      condition: "",
      fulfilment: "",
      collection: "",
    });
  });

  it("encodes punctuation and Unicode without losing the search term on reload", () => {
    const filters = parseSearch(
      new URLSearchParams({
        q: "C++ & café / textbooks?",
        shop: "campus-books",
        page: "3",
      }),
    );
    const encoded = searchParams(filters);
    expect(encoded.has("sort")).toBe(false);
    expect(encoded.has("condition")).toBe(false);
    expect(parseSearch(new URLSearchParams(encoded.toString()))).toEqual(
      filters,
    );
  });

  it.each(["-1", "1.001", "1e3", "Infinity", "10000000000", " 1", "1,00"])(
    "rejects invalid price %j",
    (min_price) => {
      const filters = parseSearch(new URLSearchParams({ min_price }));
      expect(priceError(filters)).toBe(
        "Enter a valid price with at most two decimal places.",
      );
    },
  );

  it.each(["0", "0.01", "9999999999.99"])(
    "accepts price boundary %s",
    (price) => {
      const filters = parseSearch(
        new URLSearchParams({ min_price: price, max_price: price }),
      );
      expect(priceError(filters)).toBeNull();
    },
  );

  it("compares budgets numerically rather than lexicographically", () => {
    expect(
      priceError(
        parseSearch(new URLSearchParams({ min_price: "9", max_price: "10" })),
      ),
    ).toBeNull();
    expect(
      priceError(
        parseSearch(new URLSearchParams({ min_price: "10", max_price: "9" })),
      ),
    ).toBe("Maximum price must be at least the minimum price.");
  });
});

describe("pickup notes and times", () => {
  it("omits blank fields and preserves the order of meaningful pickup instructions", () => {
    const form = new FormData();
    form.set("preferredBuilding", "   ");
    form.set("preferredTime", " 09:30 ");
    form.set("otherPickupDetails", " Meet at reception ");
    expect(buildPickupNotes(form)).toBe(
      "Preferred time: 09:30\nOther details: Meet at reception",
    );
  });

  it("bounds notes at the API limit including instruction prefixes", () => {
    const form = new FormData();
    form.set("preferredBuilding", "Library");
    form.set("otherPickupDetails", "x".repeat(500));
    const notes = buildPickupNotes(form)!;
    expect(notes).toHaveLength(500);
    expect(notes).toMatch(/^Preferred building: Library\nOther details: x+$/);
  });

  it("offers unique, ordered half-hour pickup slots from 08:00 through 22:00", () => {
    expect(PICKUP_TIME_OPTIONS).toHaveLength(29);
    expect(new Set(PICKUP_TIME_OPTIONS).size).toBe(29);
    expect(PICKUP_TIME_OPTIONS[0]).toBe("08:00");
    expect(PICKUP_TIME_OPTIONS.at(-1)).toBe("22:00");
    expect(PICKUP_TIME_OPTIONS).toEqual([...PICKUP_TIME_OPTIONS].sort());
    for (const time of PICKUP_TIME_OPTIONS)
      expect(time).toMatch(/^\d{2}:(00|30)$/);
  });
});
