export type ListingStatus = "Active" | "Draft" | "Sold" | "Paused";
export type OrderStatus = "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";

export type SellerProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  views: number;
  status: ListingStatus;
  emoji: string;
};

export type SellerOrder = {
  id: string;
  buyer: string;
  item: string;
  total: number;
  placedAt: string;
  fulfilment: "Campus pickup" | "Delivery";
  status: OrderStatus;
};

export const sellerProducts: SellerProduct[] = [
  {
    id: "prd_001",
    name: "Scientific calculator",
    category: "Electronics",
    price: 280,
    stock: 3,
    views: 124,
    status: "Active",
    emoji: "🧮",
  },
  {
    id: "prd_002",
    name: "Economics 3 textbook",
    category: "Books",
    price: 190,
    stock: 1,
    views: 88,
    status: "Active",
    emoji: "📘",
  },
  {
    id: "prd_003",
    name: "Residence mini fridge",
    category: "Appliances",
    price: 850,
    stock: 0,
    views: 203,
    status: "Sold",
    emoji: "🧊",
  },
  {
    id: "prd_004",
    name: "Wits hoodie — medium",
    category: "Clothing",
    price: 320,
    stock: 2,
    views: 52,
    status: "Draft",
    emoji: "🧥",
  },
];

export const sellerOrders: SellerOrder[] = [
  {
    id: "MP-1048",
    buyer: "Lerato M.",
    item: "Scientific calculator",
    total: 280,
    placedAt: "Today, 14:32",
    fulfilment: "Campus pickup",
    status: "New",
  },
  {
    id: "MP-1041",
    buyer: "Thabo K.",
    item: "Economics 3 textbook",
    total: 190,
    placedAt: "Yesterday, 09:15",
    fulfilment: "Campus pickup",
    status: "Preparing",
  },
  {
    id: "MP-1034",
    buyer: "Ayesha P.",
    item: "Residence mini fridge",
    total: 850,
    placedAt: "3 Aug, 17:40",
    fulfilment: "Delivery",
    status: "Completed",
  },
];

export const sellerMessages = [
  {
    id: "msg_1",
    name: "Lerato M.",
    product: "Scientific calculator",
    preview: "Hi, can I collect it after my 4pm lecture?",
    time: "5m",
    unread: true,
  },
  {
    id: "msg_2",
    name: "Neo S.",
    product: "Wits hoodie — medium",
    preview: "Is the hoodie still available?",
    time: "1h",
    unread: true,
  },
  {
    id: "msg_3",
    name: "Ayesha P.",
    product: "Residence mini fridge",
    preview: "Thanks, I received it safely.",
    time: "2d",
    unread: false,
  },
];

export const weeklyRevenue = [420, 690, 300, 920, 760, 1120, 840];
