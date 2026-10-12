const zarCurrencyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const moneyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

// Checkout and order totals always include cents; catalogue cards may omit .00.
export function formatMoney(value: number | string): string {
  return moneyFormatter.format(Number(value));
}

export function formatZAR(value: number): string {
  return zarCurrencyFormatter.format(value);
}
