import { describe, it, expect, vi } from "vitest";
import { sendEmail, sendWorkspaceInviteEmail } from "@/services/email";

vi.mock("@sendgrid/mail", () => ({ default: { setApiKey: vi.fn(), send: vi.fn() } }));
const mockResp = { statusCode: 202, body: {}, headers: {} };

describe("sendEmail", () => {
  beforeEach(() => {
    process.env.SENDGRID_API_KEY = "test-key";
    process.env.SENDGRID_FROM_EMAIL = "Zentrox <noreply@example.com>";
  });

  it("returns error when API key is not configured", async () => {
    delete process.env.SENDGRID_API_KEY;
    expect((await sendEmail({ to: "a@b.com", subject: "T", html: "<p>T</p>" })).success).toBe(false);
  });

  it("sends email successfully", async () => {
    const sg = (await import("@sendgrid/mail")).default;
    vi.mocked(sg.send).mockResolvedValueOnce([mockResp, ""]);
    expect((await sendEmail({ to: "a@b.com", subject: "T", html: "<p>T</p>" })).success).toBe(true);
  });

  it("handles send failure gracefully", async () => {
    const sg = (await import("@sendgrid/mail")).default;
    vi.mocked(sg.send).mockRejectedValueOnce(new Error("Send failed"));
    expect((await sendEmail({ to: "a@b.com", subject: "T", html: "<p>T</p>" })).success).toBe(false);
  });
});

describe("sendWorkspaceInviteEmail", () => {
  it("sends a workspace invitation email", async () => {
    const sg = (await import("@sendgrid/mail")).default;
    vi.mocked(sg.send).mockResolvedValueOnce([mockResp, ""]);
    const result = await sendWorkspaceInviteEmail("a@b.com", "My WS", "editor", "https://example.com/invite/tok", "inviter@example.com", "inv-1");
    expect(result.success).toBe(true);
    const calls = vi.mocked(sg.send).mock.calls;
    const callArg = calls[calls.length - 1][0] as { html: string };
    expect(callArg.html).toContain("My WS");
    expect(callArg.html).toContain("editor");
    expect(callArg.html).toContain("https://example.com/invite/tok");
  });

  it("handles failure gracefully", async () => {
    const sg = (await import("@sendgrid/mail")).default;
    vi.mocked(sg.send).mockRejectedValueOnce(new Error("SendGrid error"));
    const result = await sendWorkspaceInviteEmail("a@b.com", "My WS", "viewer", "https://example.com/invite/tok", "inviter@example.com", "inv-1");
    expect(result.success).toBe(false);
  });

  it("handles failure gracefully", async () => {
    const sg = (await import("@sendgrid/mail")).default;
    vi.mocked(sg.send).mockRejectedValueOnce(new Error("SendGrid error"));
    const result = await sendWorkspaceInviteEmail("a@b.com", "My WS", "viewer", "https://example.com/invite/tok", "inviter@example.com", "inv-1");
    expect(result.success).toBe(false);
  });
});
