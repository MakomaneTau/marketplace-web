import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AuthContext } from "@/hooks/use-auth";
import { apiRequest, logout, type StoredAuth } from "@/lib/api";

import { deferred } from "../helpers/deferred";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiRequest: vi.fn(),
  logout: vi.fn(),
}));
// Panel requests and MFA are separate boundaries; these tests exercise the dashboard.
vi.mock("@/components/admin/admin-mfa", () => ({
  AdminMfa: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/components/admin/admin-users", () => ({
  AdminUsers: ({ onChanged }: { onChanged: () => void }) => (
    <button onClick={onChanged}>Refresh after moderation</button>
  ),
}));
vi.mock("@/components/admin/admin-reports", () => ({
  AdminReports: () => <p>Reports panel</p>,
}));
vi.mock("@/components/admin/admin-verifications", () => ({
  AdminVerifications: () => <p>Verifications panel</p>,
}));

const admin: StoredAuth = {
  user: { id: "admin-1" },
  profile: { role: "buyer", isAdmin: true },
};
const overview = {
  buyers: 12,
  sellers: 8,
  suspended: 2,
  openReports: 3,
  pendingVerifications: 4,
};

function mount(auth: StoredAuth | null = admin, ready = true) {
  return render(
    <AuthContext.Provider value={{ auth, ready }}>
      <AdminDashboard />
    </AuthContext.Provider>,
  );
}

async function mountReady() {
  const view = mount();
  await screen.findByText("12");
  return { ...view, user: userEvent.setup() };
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    vi.mocked(apiRequest).mockResolvedValue(overview);
    vi.mocked(logout).mockReset();
  });

  it("waits for auth to settle without requesting admin data", () => {
    mount(null, false);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Checking admin access",
    );
    expect(apiRequest).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: "Admin centre" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    null,
    {
      user: { id: "buyer" },
      profile: { role: "buyer" as const, isAdmin: false },
    },
  ])("denies admin controls without admin membership: %j", (auth) => {
    mount(auth);
    expect(
      screen.getByRole("heading", { name: "Admin access required" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.queryByRole("button", { name: "Log out" }),
    ).not.toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("renders overview counts and switches the active admin section", async () => {
    const { user } = await mountReady();
    const region = screen.getByRole("region", { name: "Marketplace overview" });
    for (const count of ["12", "8", "2", "3", "4"])
      expect(within(region).getByText(count)).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/admin/overview", { auth: true });
    expect(screen.getByRole("button", { name: "Users" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByRole("button", { name: "Safety reports" }));
    expect(screen.getByText("Reports panel")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Safety reports" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.queryByRole("button", { name: "Refresh after moderation" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Seller verification" }),
    );
    expect(screen.getByText("Verifications panel")).toBeInTheDocument();
    expect(screen.queryByText("Reports panel")).not.toBeInTheDocument();
  });

  it("allows overview retry after a service failure", async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(
      new Error("private connection detail"),
    );
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to reach the marketplace service",
    );

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("12");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledTimes(2);
  });

  it("refreshes overview after a moderation panel reports a change", async () => {
    const { user } = await mountReady();
    vi.mocked(apiRequest).mockResolvedValueOnce({ ...overview, suspended: 5 });

    await user.click(
      screen.getByRole("button", { name: "Refresh after moderation" }),
    );

    await screen.findByText("5");
    expect(apiRequest).toHaveBeenCalledTimes(2);
  });

  it("shows a pending logout state and navigates only after success", async () => {
    const pending = deferred<undefined>();
    vi.mocked(logout).mockReturnValue(pending.promise);
    const { user } = await mountReady();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(screen.getByRole("status")).toHaveTextContent("Logging out");
    expect(
      screen.queryByRole("button", { name: "Log out" }),
    ).not.toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
    await act(async () => pending.resolve(undefined));
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledExactlyOnceWith("/login"),
    );
    expect(router.refresh).toHaveBeenCalledOnce();
    expect(logout).toHaveBeenCalledOnce();
  });

  it("shows a failed logout and permits a successful retry", async () => {
    vi.mocked(logout)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const { user } = await mountReady();
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to reach the marketplace service",
    );
    expect(router.replace).not.toHaveBeenCalled();
    expect(router.refresh).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(logout).toHaveBeenCalledTimes(2);
  });
});
