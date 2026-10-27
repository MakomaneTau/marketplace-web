import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SellerHeader } from "@/components/seller/seller-header";
import {
  apiRequest,
  getStoredAuth,
  logout,
  SELLER_DATA_EVENT,
} from "@/lib/api";

import { deferred } from "../helpers/deferred";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(),
  getStoredAuth: vi.fn(),
  logout: vi.fn(),
  SELLER_DATA_EVENT: "marketplace-seller-data",
}));

const profile = {
  displayName: "Thandi Mokoena",
  firstName: "Thandi",
  lastName: "Mokoena",
  avatarUrl: null,
};
const notification = {
  id: "notification-1",
  title: "New order",
  body: "A buyer ordered your textbook.",
};

function mockRequests(
  options: {
    profile?: Partial<typeof profile>;
    shop?: { name: string } | null;
    notifications?: (typeof notification)[];
  } = {},
) {
  vi.mocked(apiRequest).mockImplementation(async (path) => {
    if (path === "/profile") return { ...profile, ...options.profile };
    if (path === "/seller/shop")
      return options.shop === undefined
        ? { name: "Campus Books" }
        : options.shop;
    if (path.startsWith("/notifications?")) return options.notifications ?? [];
    if (path === "/notifications/read-all") return undefined;
    throw new Error(`Unexpected request: ${path}`);
  });
}

async function mount() {
  const onOpenMenu = vi.fn();
  const view = render(<SellerHeader onOpenMenu={onOpenMenu} />);
  await screen.findByText("Campus Books");
  return { ...view, user: userEvent.setup(), onOpenMenu };
}

describe("SellerHeader", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    vi.mocked(getStoredAuth).mockReturnValue(null);
    vi.mocked(logout).mockReset();
    mockRequests();
  });

  it("loads seller identity and exposes the mobile menu and create-product link", async () => {
    const { user, onOpenMenu } = await mount();

    expect(screen.getByText("TM")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add product/i })).toHaveAttribute(
      "href",
      "/seller/products/new",
    );
    await user.click(screen.getByRole("button", { name: "Open seller menu" }));
    expect(onOpenMenu).toHaveBeenCalledOnce();
    for (const path of [
      "/profile",
      "/seller/shop",
      "/notifications?unread=true&limit=10",
    ])
      expect(apiRequest).toHaveBeenCalledWith(path, { auth: true });
  });

  it("uses the full name when display name and shop are missing", async () => {
    mockRequests({ profile: { displayName: "" }, shop: null });
    render(<SellerHeader onOpenMenu={vi.fn()} />);

    expect(
      await screen.findByText("Thandi Mokoena's shop"),
    ).toBeInTheDocument();
    expect(screen.getByText("TM")).toBeInTheDocument();
  });

  it("uses the account email as the final identity fallback", async () => {
    vi.mocked(getStoredAuth).mockReturnValue({
      user: { id: "seller", email: "seller@example.com" },
    });
    mockRequests({
      profile: { displayName: "", firstName: "", lastName: "" },
      shop: null,
    });
    render(<SellerHeader onOpenMenu={vi.fn()} />);

    expect(
      await screen.findByText("seller@example.com's shop"),
    ).toBeInTheDocument();
  });

  it("keeps only one dropdown open and supports Escape and outside-click dismissal", async () => {
    const { user } = await mount();
    const account = screen.getByRole("button", {
      name: "Open seller account menu",
    });
    const notifications = screen.getByRole("button", { name: "Notifications" });

    await user.click(account);
    expect(account).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("navigation", { name: "Seller account" }),
    ).toBeInTheDocument();
    await user.click(notifications);
    expect(account).toHaveAttribute("aria-expanded", "false");
    expect(notifications).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.queryByRole("navigation", { name: "Seller account" }),
    ).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(notifications).toHaveAttribute("aria-expanded", "false");
    await user.click(account);
    fireEvent.pointerDown(document.body);
    expect(account).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the account menu after selecting account settings", async () => {
    const { user } = await mount();
    await user.click(
      screen.getByRole("button", { name: "Open seller account menu" }),
    );
    const settings = screen.getByRole("link", { name: "Account settings" });
    expect(settings).toHaveAttribute("href", "/seller/settings");
    // Prevent jsdom from navigating while exercising the component's click handler.
    settings.addEventListener("click", (event) => event.preventDefault());
    await user.click(settings);
    expect(
      screen.queryByRole("navigation", { name: "Seller account" }),
    ).not.toBeInTheDocument();
  });

  it("keeps notifications visible until marking them read succeeds", async () => {
    const pending = deferred<undefined>();
    mockRequests({ notifications: [notification] });
    const { user } = await mount();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText(notification.body)).toBeInTheDocument();
    vi.mocked(apiRequest).mockReturnValueOnce(pending.promise);

    await user.click(screen.getByRole("button", { name: "Mark all read" }));

    expect(apiRequest).toHaveBeenLastCalledWith("/notifications/read-all", {
      method: "PATCH",
      auth: true,
    });
    expect(screen.getByText(notification.title)).toBeInTheDocument();
    await act(async () => pending.resolve(undefined));
    expect(screen.getByText("No unread notifications.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark all read" }),
    ).not.toBeInTheDocument();
  });

  it("renders the empty notification state after a service failure", async () => {
    vi.mocked(apiRequest).mockImplementation(async (path) => {
      if (path === "/profile") return profile;
      if (path === "/seller/shop") return { name: "Campus Books" };
      throw new Error("notifications offline");
    });
    const { user } = await mount();
    await user.click(screen.getByRole("button", { name: "Notifications" }));

    expect(screen.getByText("No unread notifications.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark all read" }),
    ).not.toBeInTheDocument();
  });

  it("refreshes identity on seller-data events and unsubscribes on unmount", async () => {
    const { unmount } = await mount();
    mockRequests({ shop: { name: "Updated shop" } });
    act(() => window.dispatchEvent(new Event(SELLER_DATA_EVENT)));
    await screen.findByText("Updated shop");
    unmount();
    vi.mocked(apiRequest).mockClear();

    act(() => window.dispatchEvent(new Event(SELLER_DATA_EVENT)));

    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("waits for logout to finish before navigating to login", async () => {
    const pending = deferred<undefined>();
    vi.mocked(logout).mockReturnValue(pending.promise);
    const { user } = await mount();
    await user.click(
      screen.getByRole("button", { name: "Open seller account menu" }),
    );

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(logout).toHaveBeenCalledOnce();
    expect(router.push).not.toHaveBeenCalled();
    await act(async () => pending.resolve(undefined));
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledExactlyOnceWith("/login"),
    );
  });
});
