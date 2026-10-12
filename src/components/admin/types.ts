export type AdminTab = "users" | "reports" | "verifications";

export type AdminOverview = {
  buyers: number;
  sellers: number;
  suspended: number;
  openReports: number;
  pendingVerifications: number;
};

export type AdminUser = {
  id: string;
  displayName: string;
  role: "buyer" | "seller";
  isAdmin: boolean;
  verificationStatus: string;
  createdAt: string;
  restriction: { reason: string; suspended_at: string } | null;
};

export type SafetyReport = {
  id: string;
  category: string;
  details: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
  subjectUserId: string | null;
  productId: string | null;
  reporterName: string;
  subjectName: string | null;
  resolutionNote: string | null;
};

export type SellerVerification = {
  id: string;
  sellerId: string;
  sellerName: string;
  status: "pending" | "verified" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type PageResult<T, K extends string> = {
  total: number;
  page: number;
  limit: number;
} & Record<K, T[]>;
