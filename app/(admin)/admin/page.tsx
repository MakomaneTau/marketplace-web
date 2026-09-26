import type { Metadata } from "next";

import { AdminDashboard } from "@/app/components/admin/admin-dashboard";

export const metadata: Metadata = { title: "Admin centre | Marketplace", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <AdminDashboard />;
}
