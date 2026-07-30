export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  location: string;
  condition:
    | "New"
    | "Like new"
    | "Good"
    | "Fair";
}