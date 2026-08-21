import { Bell, CreditCard, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

import { SectionHeading } from "@/app/components/seller/section-heading";

const notifications = [
  { title: "New order", description: "Notify me immediately when a buyer places an order.", checked: true },
  { title: "New message", description: "Notify me when a buyer sends a message.", checked: true },
  { title: "Listing updates", description: "Receive reminders about expired or low-stock listings.", checked: true },
  { title: "Marketplace tips", description: "Receive occasional selling and safety tips.", checked: false },
];

export default function SellerSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Preferences"
        title="Seller settings"
        description="Manage your seller account, payments, notifications, and security."
      />

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:self-start">
          {[
            { label: "Account", icon: UserRound, active: true },
            { label: "Notifications", icon: Bell },
            { label: "Payments", icon: CreditCard },
            { label: "Security", icon: LockKeyhole },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} type="button" className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${item.active ? "bg-violet-50 text-violet-800" : "text-slate-600 hover:bg-slate-50"}`}>
                <Icon className="h-5 w-5" /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-violet-50 p-2 text-violet-700"><UserRound className="h-5 w-5" /></span>
              <div>
                <h2 className="font-bold text-slate-950">Seller account</h2>
                <p className="text-xs text-slate-500">Contact details used for important account communication.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">First name</span><input defaultValue="John" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Last name</span><input defaultValue="Doe" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Email</span><input type="email" defaultValue="john.doe@example.com" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label>
              <label><span className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</span><input type="tel" defaultValue="+27 00 000 0000" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" /></label>
            </div>
            <button type="button" className="mt-5 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800">Save account</button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-violet-50 p-2 text-violet-700"><Bell className="h-5 w-5" /></span>
              <div>
                <h2 className="font-bold text-slate-950">Notifications</h2>
                <p className="text-xs text-slate-500">Choose the seller activity you want to hear about.</p>
              </div>
            </div>
            <div className="mt-5 divide-y divide-slate-100">
              {notifications.map((item) => (
                <label key={item.title} className="flex cursor-pointer items-start justify-between gap-5 py-4 first:pt-0 last:pb-0">
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                  </span>
                  <input type="checkbox" defaultChecked={item.checked} className="mt-1 h-5 w-5 shrink-0 accent-violet-700" />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <h2 className="font-bold text-emerald-950">Identity verified</h2>
                <p className="mt-1 text-sm text-emerald-800">Your seller identity has been verified. Buyers will see a verification badge on your shop.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
