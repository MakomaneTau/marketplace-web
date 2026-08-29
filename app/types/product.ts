export type ProductCondition = "New" | "Like new" | "Good" | "Fair";

export interface SellerSummary {
  id: string;
  name: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  memberSince: string;
  campus: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageUrls: string[];
  location: string;
  condition: ProductCondition;
  categorySlug: string;
  createdAt: string;
  seller: SellerSummary;
  isFavourite?: boolean;
}
