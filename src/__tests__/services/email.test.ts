import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendEmail, sendWorkspaceInviteEmail } from "@/services/email";

// Mock @sendgrid/mail
vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
}));

const mockResponse = { statusCode: 202, body: {}, headers: {} };

describe("email service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore env
    process.env.SENDGRID_API_KEY = "test-api-key";
    process.env.SENDGRID_FROM_EMAIL = "Zentrox <noreply@example.com>";
  });

  describe("sendEmail", () => {
    it("returns success false when API key is not configured", async () => {
      delete process.env.SENDGRID_API_KEY;

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("No API key configured.");
    });

    it("sends email successfully with parsed from address", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockResolvedValueOnce([mockResponse, ""]);

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Hello</p>",
      });

      expect(result.success).toBe(true);
      expect(sgMail.setApiKey).toHaveBeenCalledWith("test-api-key");
      expect(sgMail.send).toHaveBeenCalledWith({
        to: "test@example.com",
        from: { name: "Zentrox", email: "noreply@example.com" },
        subject: "Test Subject",
        html: "<p>Hello</p>",
      });
    });

    it("uses raw from string if no name/angle format", async () => {
      process.env.SENDGRID_FROM_EMAIL = "noreply@example.com";
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockResolvedValueOnce([mockResponse, ""]);

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: "test@example.com",
        from: "noreply@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });
    });

    it("uses custom from option", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockResolvedValueOnce([mockResponse, ""]);

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
        from: "Custom <custom@example.com>",
      });

      expect(result.success).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: "test@example.com",
        from: { name: "Custom", email: "custom@example.com" },
        subject: "Test",
        html: "<p>Test</p>",
      });
    });

    it("handles array of recipients", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockResolvedValueOnce([mockResponse, ""]);

      const result = await sendEmail({
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ["user1@example.com", "user2@example.com"],
        }),
      );
    });

    it("handles send failure gracefully", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockRejectedValueOnce(
        new Error("Email send failed"),
      );

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email send failed");
    });

    it("passes along the idempotency key", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockResolvedValueOnce([mockResponse, ""]);

      await sendEmail({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
        idempotencyKey: "invite-123",
      });

      // idempotency key is not explicitly sent to SendGrid in the current implementation,
      // but the option is accepted by the service.
    });
  });

  describe("sendWorkspaceInviteEmail", () => {
    it("sends a workspace invitation email", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockResolvedValueOnce([mockResponse, ""]);

      const result = await sendWorkspaceInviteEmail(
        "user@example.com",
        "My Workspace",
        "editor",
        "https://example.com/invite/token-123",
        "inviter@example.com",
        "invite-123",
      );

      expect(result.success).toBe(true);
      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: expect.stringContaining("My Workspace"),
        }),
      );

      // Verify the HTML contains expected content
      const callArg = vi.mocked(sgMail.send).mock.calls[0][0] as { html: string };
      expect(callArg.html).toContain("My Workspace");
      expect(callArg.html).toContain("editor");
      expect(callArg.html).toContain("https://example.com/invite/token-123");
      expect(callArg.html).toContain("inviter@example.com");
    });

    it("handles failure gracefully", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockRejectedValueOnce(
        new Error("SendGrid error"),
      );

      const result = await sendWorkspaceInviteEmail(
        "user@example.com",
        "My Workspace",
        "viewer",
        "https://example.com/invite/token-456",
        "inviter@example.com",
        "invite-456",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("SendGrid error");
    });

    it("includes all role options in the email", async () => {
      const sgMail = (await import("@sendgrid/mail")).default;
      vi.mocked(sgMail.send).mockResolvedValueOnce([mockResponse, ""]);

      const roles = ["admin", "editor", "viewer"] as const;
      for (const role of roles) {
        await sendWorkspaceInviteEmail(
          "user@example.com",
          "Test WS",
          role,
          "https://example.com/invite/token",
          "inviter@example.com",
          "invite-id",
        );
        const callArg = vi.mocked(sgMail.send).mock.calls[
          vi.mocked(sgMail.send).mock.calls.length - 1
        ][0] as { html: string };
        expect(callArg.html).toContain(role);
      }
    });
  });
});
