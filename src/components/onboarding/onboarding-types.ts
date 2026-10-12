export type OnboardingRole = "buyer" | "seller";

export interface OnboardingState {
  version: number;
  role: OnboardingRole;
  welcomeSeen: boolean;
  dismissed: boolean;
  steps: Record<string, boolean>;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  action: string;
}

export const onboardingSteps: Record<OnboardingRole, OnboardingStep[]> = {
  buyer: [
    { id: "campus", title: "Add your campus", description: "Keep nearby listings and meetups relevant to you.", href: "/profile", action: "Update profile" },
    { id: "favourite", title: "Save something you like", description: "Use the heart on a listing so you can find it again.", href: "/search", action: "Browse listings" },
    { id: "message", title: "Ask a seller a question", description: "Open a listing and use Message seller before you buy.", href: "/search", action: "Find a product" },
    { id: "order", title: "Place your first order", description: "Choose pickup or delivery and keep track of progress in Orders.", href: "/orders", action: "View orders" },
  ],
  seller: [
    { id: "shop", title: "Create your shop profile", description: "Add a clear name and details buyers can trust.", href: "/seller/shop", action: "Set up shop" },
    { id: "pickup", title: "Choose pickup areas", description: "Tell buyers where campus collection is available.", href: "/seller/shop", action: "Add pickup areas" },
    { id: "listing", title: "Publish your first listing", description: "Add accurate photos, condition, price and fulfilment options.", href: "/seller/products/new", action: "Add product" },
    { id: "open", title: "Open your shop", description: "Make your shop and active listings visible to buyers.", href: "/seller/shop", action: "Review shop" },
  ],
};
