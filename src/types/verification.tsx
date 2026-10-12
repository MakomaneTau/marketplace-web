export interface SellerVerificationFiles {
    selfie: File | null;
    idCard: File | null;
}

export type VerificationStatus = "pending" | "verified" | "rejected";