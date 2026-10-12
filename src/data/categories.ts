import {
  Armchair,
  Bike,
  BookOpen,
  Calculator,
  Dumbbell,
  Gamepad2,
  Headphones,
  Laptop,
  PackageOpen,
  Shirt,
  Smartphone,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  name: string;
  slug: string;
  description: string;
  productCount: number;
  icon: LucideIcon;
  featured?: boolean;
}

export const categories: Category[] = [
  {
    name: "Textbooks",
    slug: "textbooks",
    description:
      "Academic books, study guides and course materials.",
    productCount: 126,
    icon: BookOpen,
    featured: true,
  },
  {
    name: "Laptops",
    slug: "laptops",
    description:
      "Laptops, chargers, computer accessories and parts.",
    productCount: 48,
    icon: Laptop,
    featured: true,
  },
  {
    name: "Phones",
    slug: "phones",
    description:
      "Smartphones, phone cases, chargers and accessories.",
    productCount: 73,
    icon: Smartphone,
    featured: true,
  },
  {
    name: "Calculators",
    slug: "calculators",
    description:
      "Scientific, financial and graphing calculators.",
    productCount: 41,
    icon: Calculator,
    featured: true,
  },
  {
    name: "Furniture",
    slug: "furniture",
    description:
      "Desks, chairs, shelves and residence furniture.",
    productCount: 52,
    icon: Armchair,
  },
  {
    name: "Clothing",
    slug: "clothing",
    description:
      "Everyday clothing, formal wear, shoes and accessories.",
    productCount: 89,
    icon: Shirt,
    featured: true,
  },
  {
    name: "Gaming",
    slug: "gaming",
    description:
      "Consoles, games, controllers and gaming accessories.",
    productCount: 35,
    icon: Gamepad2,
  },
  {
    name: "Audio",
    slug: "audio",
    description:
      "Headphones, speakers, microphones and audio equipment.",
    productCount: 44,
    icon: Headphones,
    featured: true,
  },
  {
    name: "Sports",
    slug: "sports",
    description:
      "Sportswear, gym equipment and sporting accessories.",
    productCount: 31,
    icon: Dumbbell,
  },
  {
    name: "Transport",
    slug: "transport",
    description:
      "Bicycles, skateboards and student transport accessories.",
    productCount: 18,
    icon: Bike,
  },
  {
    name: "Kitchen",
    slug: "kitchen",
    description:
      "Cookware, appliances and residence kitchen essentials.",
    productCount: 56,
    icon: Utensils,
  },
  {
    name: "Other",
    slug: "other",
    description:
      "Useful student items that do not fit another category.",
    productCount: 22,
    icon: PackageOpen,
  },
];

export function getCategoryBySlug(
  slug: string,
): Category | undefined {
  return categories.find(
    (category) => category.slug === slug,
  );
}