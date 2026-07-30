const zarCurrencyFormatter = new Intl.NumberFormat(
  "en-ZA",
  {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
);

export function formatZAR(
  value: number,
): string {
  return zarCurrencyFormatter.format(value);
}