export interface SearchFilters {
  q: string;
  category: string;
  shop: string;
  condition: string;
  sort: string;
  campus: string;
  min_price: string;
  max_price: string;
  fulfilment: string;
  collection: string;
  page: number;
}
export function parseSearch(params: URLSearchParams): SearchFilters {
  const condition = (params.get("condition") || "")
    .toLowerCase()
    .replaceAll(" ", "_");
  const sort = params.get("sort") || "newest";
  return {
    q: params.get("q") || "",
    category: params.get("category") || "",
    shop: params.get("shop") || "",
    condition: ["new", "like_new", "good", "fair"].includes(condition)
      ? condition
      : "",
    sort:
      (
        { "price-low": "price_asc", "price-high": "price_desc" } as Record<
          string,
          string
        >
      )[sort] ||
      (["newest", "price_asc", "price_desc", "most_viewed"].includes(sort)
        ? sort
        : "newest"),
    campus: params.get("campus") || "",
    min_price: params.get("min_price") || "",
    max_price: params.get("max_price") || "",
    collection: params.get("collection") === "this-week" ? "this-week" : "",
    fulfilment: ["campus_pickup", "delivery"].includes(
      params.get("fulfilment") || "",
    )
      ? params.get("fulfilment")!
      : "",
    page: /^\d+$/.test(params.get("page") || "")
      ? Math.max(1, Math.min(1000000, Number(params.get("page"))))
      : 1,
  };
}
export function searchParams(filters: SearchFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (
      value !== "" &&
      !(key === "sort" && value === "newest") &&
      !(key === "page" && value === 1)
    )
      params.set(key, String(value));
  }
  return params;
}
export function priceError(filters: SearchFilters) {
  for (const value of [filters.min_price, filters.max_price]) {
    if (
      value &&
      (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) > 9999999999.99)
    )
      return "Enter a valid price with at most two decimal places.";
  }
  return filters.min_price &&
    filters.max_price &&
    Number(filters.min_price) > Number(filters.max_price)
    ? "Maximum price must be at least the minimum price."
    : null;
}
