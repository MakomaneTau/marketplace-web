import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SellerHeader } from "@/components/seller/seller-header";
import {
  getCurrentAuth,
  getStoredAuth,
  logout,
  notifySellerDataChanged,
} from "@/lib/api";

import { deferred } from "../helpers/deferred";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const auth = { user: { id: "seller-1" }, profile: { role: "seller" } };

describe("seller UI with the real session client", () => {
  beforeEach(async () => {
    // Reset the real API module's session cache through its public logout API.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await logout();
  });

  function installGateway(
    options: { logoutStatus?: number; pendingLogout?: Promise<Response> } = {},
  ) {
    let shopName = "Campus Books";
    const fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const path = String(input);
        if (path.endsWith("/auth/me")) return Response.json({ data: auth });
        if (path.endsWith("/auth/logout"))
          return (
            options.pendingLogout ??
            new Response(null, { status: options.logoutStatus ?? 204 })
          );
        if (path.endsWith("/profile"))
          return Response.json({
            data: { displayName: "Thandi Mokoena", avatarUrl: null },
          });
        if (path.endsWith("/seller/shop"))
          return Response.json({ data: { name: shopName } });
        if (path.includes("/notifications?"))
          return Response.json({
            data: [{ id: "n1", title: "New order", body: "Your book sold." }],
          });
        if (path.endsWith("/notifications/read-all")) {
          expect(init?.method).toBe("PATCH");
          return new Response(null, { status: 204 });
        }
        throw new Error(`Unexpected gateway request: ${path}`);
      },
    );
    vi.stubGlobal("fetch", fetch);
    return {
      fetch,
      renameShop: (name: string) => {
        shopName = name;
      },
    };
  }

  async function openAccount() {
    const user = userEvent.setup();
    render(<SellerHeader onOpenMenu={vi.fn()} />);
    await screen.findByText("Campus Books");
    await user.click(
      screen.getByRole("button", { name: "Open seller account menu" }),
    );
    return user;
  }

  it.each([204, 401])(
    "clears the real session and navigates after logout returns %s",
    async (logoutStatus) => {
      const gateway = installGateway({ logoutStatus });
      await getCurrentAuth(true);
      expect(getStoredAuth()?.user.id).toBe("seller-1");
      const user = await openAccount();
      const authChanged = vi.fn();
      window.addEventListener("marketplace-auth", authChanged);
      try {
        await user.click(screen.getByRole("button", { name: "Log out" }));

        await waitFor(() =>
          expect(router.push).toHaveBeenCalledExactlyOnceWith("/login"),
        );
        expect(getStoredAuth()).toBeNull();
        expect(authChanged).toHaveBeenCalledOnce();
        const [, init] = gateway.fetch.mock.calls.find(([url]) =>
          String(url).endsWith("/auth/logout"),
        )!;
        expect(init).toMatchObject({
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });
        expect(new Headers(init?.headers).get("x-marketplace-auth")).toBe(
          "required",
        );
      } finally {
        window.removeEventListener("marketplace-auth", authChanged);
      }
    },
  );

  it("waits for the HTTP logout response before discarding the session or navigating", async () => {
    const pending = deferred<Response>();
    installGateway({ pendingLogout: pending.promise });
    await getCurrentAuth(true);
    const user = await openAccount();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(getStoredAuth()?.user.id).toBe("seller-1");
    expect(router.push).not.toHaveBeenCalled();
    await act(async () => pending.resolve(new Response(null, { status: 204 })));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/login"));
    expect(getStoredAuth()).toBeNull();
  });

  it("loads notification envelopes and sends an authenticated read-all mutation", async () => {
    const gateway = installGateway();
    render(<SellerHeader onOpenMenu={vi.fn()} />);
    const user = userEvent.setup();
    await screen.findByText("Campus Books");
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Your book sold.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark all read" }));

    expect(
      await screen.findByText("No unread notifications."),
    ).toBeInTheDocument();
    const [, init] = gateway.fetch.mock.calls.find(([url]) =>
      String(url).endsWith("/notifications/read-all"),
    )!;
    expect(new Headers(init?.headers).get("x-marketplace-auth")).toBe(
      "required",
    );
    expect(init?.credentials).toBe("same-origin");
  });

  it("refreshes the rendered identity when the API client publishes seller-data changes", async () => {
    const gateway = installGateway();
    render(<SellerHeader onOpenMenu={vi.fn()} />);
    await screen.findByText("Campus Books");
    gateway.renameShop("New semester books");

    act(() => notifySellerDataChanged());

    expect(await screen.findByText("New semester books")).toBeInTheDocument();
    expect(
      gateway.fetch.mock.calls.filter(([url]) =>
        String(url).endsWith("/profile"),
      ),
    ).toHaveLength(2);
  });
});
