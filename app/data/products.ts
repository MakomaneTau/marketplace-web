import type { Product } from "@/app/types/product";

const seller = {
  id: "seller-1",
  name: "Neo Student Store",
  verified: true,
  rating: 4.8,
  reviewCount: 32,
  memberSince: "2026",
  campus: "Wits Main Campus",
};

const placeholder = "/images/product-placeholder.svg";

export const products: Product[] = [
  {
    id: "casio-fx-991za",
    name: "Casio FX-991ZA Plus Scientific Calculator",
    description:
      "A reliable scientific calculator in good working condition. Suitable for engineering, economics and science modules. Includes protective cover.",
    price: 350,
    imageUrl: placeholder,
    imageUrls: [placeholder, placeholder, placeholder],
    location: "Wits Main Campus",
    condition: "Good",
    categorySlug: "calculators",
    createdAt: "2026-07-29",
    seller,
    isFavourite: true,
  },
  {
    id: "economics-textbook",
    name: "Intermediate Microeconomics Textbook",
    description:
      "Clean copy with light highlighting in a few chapters. Ideal for second- and third-year economics students.",
    price: 250,
    imageUrl: placeholder,
    imageUrls: [placeholder, placeholder],
    location: "Braamfontein",
    condition: "Like new",
    categorySlug: "textbooks",
    createdAt: "2026-07-28",
    seller,
    isFavourite: true,
  },
  {
    id: "wireless-headphones",
    name: "Wireless Over-Ear Headphones",
    description:
      "Comfortable Bluetooth headphones with strong battery life. Charging cable included.",
    price: 500,
    imageUrl: placeholder,
    imageUrls: [placeholder, placeholder],
    location: "Wits Junction",
    condition: "Good",
    categorySlug: "audio",
    createdAt: "2026-07-27",
    seller,
    isFavourite: true,
  },
  {
    id: "study-desk-lamp",
    name: "LED Study Desk Lamp",
    description:
      "Adjustable desk lamp with three brightness levels and USB power. Great for residence study desks.",
    price: 180,
    imageUrl: placeholder,
    imageUrls: [placeholder],
    location: "Parktown",
    condition: "Like new",
    categorySlug: "furniture",
    createdAt: "2026-07-26",
    seller,
  },
  {
    id: "mechanical-keyboard",
    name: "Compact Mechanical Keyboard",
    description:
      "Compact wired mechanical keyboard with responsive switches. Fully functional and recently cleaned.",
    price: 650,
    imageUrl: placeholder,
    imageUrls: [placeholder, placeholder],
    location: "Braamfontein",
    condition: "Good",
    categorySlug: "laptops",
    createdAt: "2026-07-25",
    seller,
  },
  {
    id: "algorithms-textbook",
    name: "Introduction to Algorithms Study Copy",
    description:
      "Useful algorithms reference with some handwritten notes. Binding remains strong and all pages are present.",
    price: 300,
    imageUrl: placeholder,
    imageUrls: [placeholder],
    location: "Wits Main Campus",
    condition: "Fair",
    categorySlug: "textbooks",
    createdAt: "2026-07-24",
    seller,
  },
  {
    id: "office-chair",
    name: "Student Office Chair",
    description:
      "Comfortable office chair suitable for a residence room or study area. Collection only.",
    price: 450,
    imageUrl: placeholder,
    imageUrls: [placeholder, placeholder],
    location: "Wits Junction",
    condition: "Fair",
    categorySlug: "furniture",
    createdAt: "2026-07-23",
    seller,
  },
  {
    id: "laptop-backpack",
    name: "Water-Resistant Laptop Backpack",
    description:
      "Padded backpack that fits laptops up to 15.6 inches. Includes multiple compartments for books and accessories.",
    price: 280,
    imageUrl: placeholder,
    imageUrls: [placeholder],
    location: "Braamfontein",
    condition: "Like new",
    categorySlug: "other",
    createdAt: "2026-07-22",
    seller,
  },
  {
    id: "iphone-13-case",
    name: "iPhone 13 Protective Case",
    description: "Unused shock-resistant phone case in its original packaging.",
    price: 90,
    imageUrl: placeholder,
    imageUrls: [placeholder],
    location: "Wits Main Campus",
    condition: "New",
    categorySlug: "phones",
    createdAt: "2026-07-21",
    seller,
  },
  {
    id: "gaming-controller",
    name: "Wireless Gaming Controller",
    description: "Wireless controller with charging cable. Tested and working correctly.",
    price: 420,
    imageUrl: placeholder,
    imageUrls: [placeholder, placeholder],
    location: "Parktown",
    condition: "Good",
    categorySlug: "gaming",
    createdAt: "2026-07-20",
    seller,
  },
];

export const featuredProducts = products.slice(0, 8);

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}
