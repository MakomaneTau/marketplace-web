import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminMfa } from "@/components/admin/admin-mfa";
import { apiRequest, ApiClientError } from "@/lib/api";

import { deferred } from "../helpers/deferred";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiRequest: vi.fn(),
}));

const factor = { id: "factor-1", name: "Phone authenticator" };
const unverified = { verified: false, factors: [factor] };
const protectedContent = "Private admin tools";

function mount() {
  return render(
    <AdminMfa>
      <p>{protectedContent}</p>
    </AdminMfa>,
  );
}

describe("AdminMfa", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
  });

  it("keeps protected children hidden while checking the session", () => {
    vi.mocked(apiRequest).mockReturnValue(new Promise(() => {}));
    mount();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Checking account security",
    );
    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/auth/mfa/status", { auth: true });
  });

  it("renders children only after the server reports a verified session", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      verified: true,
      factors: [factor],
    });
    mount();

    expect(await screen.findByText(protectedContent)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Secure your admin account" }),
    ).not.toBeInTheDocument();
  });

  it("fails closed with a useful alert when session security cannot be checked", async () => {
    vi.mocked(apiRequest).mockRejectedValue(
      new ApiClientError(
        503,
        "AUTH_SERVICE_UNAVAILABLE",
        "Authentication is temporarily unavailable.",
      ),
    );
    mount();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Authentication is temporarily unavailable.",
    );
    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("sanitizes the six-digit code and waits for an authoritative verified status", async () => {
    const pending = deferred<unknown>();
    vi.mocked(apiRequest)
      .mockResolvedValueOnce(unverified)
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce({ ...unverified, verified: true });
    mount();
    const user = userEvent.setup();
    const code = await screen.findByLabelText("Six-digit code");
    const submit = screen.getByRole("button", { name: "Verify and continue" });
    expect(submit).toBeDisabled();
    await user.type(code, "12x34567");
    expect(code).toHaveValue("123456");
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(screen.getByRole("button", { name: /Verifying/ })).toBeDisabled();
    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/auth/mfa/verify", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ factorId: factor.id, code: "123456" }),
    });
    await act(async () => pending.resolve(undefined));
    expect(await screen.findByText(protectedContent)).toBeInTheDocument();
    expect(apiRequest).toHaveBeenNthCalledWith(3, "/auth/mfa/status", {
      auth: true,
    });
  });

  it("keeps admin tools locked if verification responds successfully but the session is still unverified", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce(unverified)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(unverified);
    mount();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Six-digit code"), "123456");

    await user.click(
      screen.getByRole("button", { name: "Verify and continue" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Verification did not complete. Please try again.",
    );
    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Six-digit code")).toHaveValue("");
  });

  it("shows verification errors without unlocking children or rechecking status", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce(unverified)
      .mockRejectedValueOnce(
        new ApiClientError(
          400,
          "MFA_CODE_INVALID",
          "Invalid authenticator code.",
        ),
      );
    mount();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Six-digit code"), "123456");

    await user.click(
      screen.getByRole("button", { name: "Verify and continue" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid authenticator code.",
    );
    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify and continue" }),
    ).toBeEnabled();
    expect(apiRequest).toHaveBeenCalledTimes(2);
  });

  it("enrolls an authenticator without exposing admin tools before verification", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ verified: false, factors: [] })
      .mockResolvedValueOnce({ id: factor.id, secret: "PRIVATE-SETUP-KEY" });
    mount();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "Set up authenticator" }),
    );

    expect(await screen.findByText("PRIVATE-SETUP-KEY")).toBeInTheDocument();
    expect(screen.getByLabelText("Six-digit code")).toBeInTheDocument();
    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
    expect(apiRequest).toHaveBeenLastCalledWith("/auth/mfa/enroll", {
      method: "POST",
      auth: true,
    });
  });
});
