export type BasketItem = { productId: string; quantity: number };
const key = (userId: string) => `marketplace-basket:${userId}`;
export function readBasket(userId: string): BasketItem[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(key(userId)) || "[]",
    );
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (item): item is BasketItem =>
          item &&
          typeof item.productId === "string" &&
          /^[0-9a-f-]{36}$/i.test(item.productId) &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= 99,
      )
      .slice(0, 20);
  } catch {
    return [];
  }
}
export function writeBasket(userId: string, items: BasketItem[]) {
  localStorage.setItem(key(userId), JSON.stringify(items));
  window.dispatchEvent(new Event("marketplace-basket"));
}
export function addToBasket(userId: string, productId: string) {
  const items = readBasket(userId);
  const item = items.find((entry) => entry.productId === productId);
  if (item) item.quantity = Math.min(99, item.quantity + 1);
  else {
    if (items.length >= 20)
      throw new Error(
        "Your basket holds up to 20 different items. Remove an item first.",
      );
    items.push({ productId, quantity: 1 });
  }
  writeBasket(userId, items);
}
