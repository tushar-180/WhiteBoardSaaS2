import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  requireActionAuth: vi.fn(),
}));

vi.mock("@/services/email", () => ({
  sendWorkspaceInviteEmail: vi.fn(),
}));

vi.mock("@/services/invite", () => ({
  createWorkspaceInvite: vi.fn(),
  acceptWorkspaceInvite: vi.fn(),
  revokeWorkspaceInvite: vi.fn(),
  rejectWorkspaceInvite: vi.fn(),
  fetchInviteByToken: vi.fn(),
  fetchUserNotifications: vi.fn(),
  dismissInviteNotification: vi.fn(),
  checkIfInviteIsPending: vi.fn(),
  fetchPendingInvitesByWorkspace: vi.fn(),
  bulkCreateWorkspaceInvites: vi.fn(),
  bulkRevokeWorkspaceInvites: vi.fn(),
}));

vi.mock("@/services/workspace", () => ({
  fetchWorkspaceById: vi.fn(),
}));

vi.mock("@/services/member", () => ({
  fetchWorkspaceMemberRole: vi.fn(),
  checkIfEmailIsMember: vi.fn(),
}));

vi.mock("@/services/profile", () => ({
  searchProfilesByEmail: vi.fn(),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn(() => ({ capture: vi.fn() })),
}));

import { requireActionAuth } from "@/utils/supabase/server";
import { sendWorkspaceInviteEmail } from "@/services/email";
import {
  createWorkspaceInvite,
  acceptWorkspaceInvite,
  revokeWorkspaceInvite,
  rejectWorkspaceInvite,
  fetchInviteByToken,
  checkIfInviteIsPending,
  bulkCreateWorkspaceInvites,
} from "@/services/invite";
import { fetchWorkspaceById } from "@/services/workspace";
import { fetchWorkspaceMemberRole, checkIfEmailIsMember } from "@/services/member";
import { searchProfilesByEmail } from "@/services/profile";
import {
  createInviteAction,
  acceptInviteAction,
  revokeInviteAction,
  rejectInviteAction,
  searchProfilesAction,
  bulkInviteUsersAction,
} from "@/actions/invite";

describe("createInviteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "inviter@example.com" } as any,
      supabase: {} as any,
    });
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", name: "Test WS", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
  });

  it("creates an invite and attempts to send email", async () => {
    vi.mocked(checkIfEmailIsMember).mockResolvedValue(null);
    vi.mocked(checkIfInviteIsPending).mockResolvedValue(false);
    vi.mocked(createWorkspaceInvite).mockResolvedValue({ id: "inv-1", token: "token-123" } as any);
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    vi.mocked(sendWorkspaceInviteEmail).mockResolvedValue({ success: true });

    const result = await createInviteAction("ws-1", "test@example.com", "editor");
    expect(result.inviteLink).toContain("https://example.com/invite/token-123");
    expect(result.emailSent).toBe(true);
  });

  it("rejects invalid email", async () => {
    await expect(createInviteAction("ws-1", "not-an-email", "editor")).rejects.toThrow("valid email");
  });

  it("rejects non-owner/admin", async () => {
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("editor");

    await expect(createInviteAction("ws-1", "test@example.com", "editor")).rejects.toThrow("Only workspace owners and administrators");
  });

  it("rejects if email is already a member", async () => {
    vi.mocked(checkIfEmailIsMember).mockResolvedValue("editor");

    await expect(createInviteAction("ws-1", "test@example.com", "editor")).rejects.toThrow("already a member");
  });

  it("rejects if invite is already pending", async () => {
    vi.mocked(checkIfEmailIsMember).mockResolvedValue(null);
    vi.mocked(checkIfInviteIsPending).mockResolvedValue(true);

    await expect(createInviteAction("ws-1", "test@example.com", "editor")).rejects.toThrow("already pending");
  });
});

describe("acceptInviteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" } as any,
      supabase: {} as any,
    });
  });

  it("accepts an invite when email matches", async () => {
    vi.mocked(fetchInviteByToken).mockResolvedValue({
      id: "inv-1",
      workspace_id: "ws-1",
      email: "test@example.com",
      role: "editor",
      token: "tok",
      status: "pending",
      workspace_name: "Test WS",
      created_at: "",
    } as any);
    vi.mocked(acceptWorkspaceInvite).mockResolvedValue("ws-1");

    const result = await acceptInviteAction("tok");
    expect(result).toBe("ws-1");
  });

  it("rejects if email does not match", async () => {
    vi.mocked(fetchInviteByToken).mockResolvedValue({ email: "other@example.com" } as any);

    await expect(acceptInviteAction("tok")).rejects.toThrow("Please log in with that email address");
  });

  it("rejects if invite not found", async () => {
    vi.mocked(fetchInviteByToken).mockResolvedValue(null);

    await expect(acceptInviteAction("tok")).rejects.toThrow("Invitation is invalid");
  });
});

describe("revokeInviteAction", () => {
  it("revokes an invite", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(revokeWorkspaceInvite).mockResolvedValue(undefined);

    await revokeInviteAction("ws-1", "inv-1");
    expect(revokeWorkspaceInvite).toHaveBeenCalledWith("ws-1", "inv-1");
  });
});

describe("rejectInviteAction", () => {
  it("rejects an invite", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(rejectWorkspaceInvite).mockResolvedValue("ws-1");

    await rejectInviteAction("tok");
    expect(rejectWorkspaceInvite).toHaveBeenCalledWith("tok", "user-1");
  });
});

describe("searchProfilesAction", () => {
  it("searches profiles by email", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    const mockProfiles = [{ id: "1", email: "test@example.com" }];
    vi.mocked(searchProfilesByEmail).mockResolvedValue(mockProfiles as any);

    const result = await searchProfilesAction("test");
    expect(result).toEqual(mockProfiles);
  });
});

describe("bulkInviteUsersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "inviter@example.com" } as any,
      supabase: {} as any,
    });
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", name: "Test" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
  });

  it("invites multiple valid users", async () => {
    vi.mocked(checkIfEmailIsMember).mockResolvedValue(null);
    vi.mocked(checkIfInviteIsPending).mockResolvedValue(false);
    vi.mocked(bulkCreateWorkspaceInvites).mockResolvedValue([
      { id: "inv-1", token: "tok1", email: "a@b.com" },
      { id: "inv-2", token: "tok2", email: "c@d.com" },
    ] as any);
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    vi.mocked(sendWorkspaceInviteEmail).mockResolvedValue({ success: true });

    const result = await bulkInviteUsersAction("ws-1", ["a@b.com", "c@d.com"], "editor");
    expect(result.successfulEmails).toHaveLength(2);
    expect(result.failedEmails).toHaveLength(0);
  });
});
