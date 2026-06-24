import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({ requireActionAuth: vi.fn(), createClient: vi.fn() }));
vi.mock("@/services/email", () => ({ sendWorkspaceInviteEmail: vi.fn() }));
vi.mock("@/services/invite", () => ({ createWorkspaceInvite: vi.fn(), acceptWorkspaceInvite: vi.fn(), revokeWorkspaceInvite: vi.fn(), rejectWorkspaceInvite: vi.fn(), fetchInviteByToken: vi.fn(), checkIfInviteIsPending: vi.fn(), bulkCreateWorkspaceInvites: vi.fn() }));
vi.mock("@/services/workspace", () => ({ fetchWorkspaceById: vi.fn() }));
vi.mock("@/services/member", () => ({ fetchWorkspaceMemberRole: vi.fn(), checkIfEmailIsMember: vi.fn() }));
vi.mock("@/services/profile", () => ({ searchProfilesByEmail: vi.fn() }));
vi.mock("@/lib/posthog-server", () => ({ getPostHogClient: vi.fn(() => ({ capture: vi.fn() })) }));

import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { sendWorkspaceInviteEmail } from "@/services/email";
import { createWorkspaceInvite, acceptWorkspaceInvite, revokeWorkspaceInvite, rejectWorkspaceInvite, fetchInviteByToken, checkIfInviteIsPending, bulkCreateWorkspaceInvites } from "@/services/invite";
import { fetchWorkspaceById } from "@/services/workspace";
import { fetchWorkspaceMemberRole, checkIfEmailIsMember } from "@/services/member";
import { searchProfilesByEmail } from "@/services/profile";
import { createInviteAction, acceptInviteAction, revokeInviteAction, rejectInviteAction, searchProfilesAction, bulkInviteUsersAction } from "@/actions/invite";

describe("createInviteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "inviter@a.com" } as any, supabase: {} as any });
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", name: "Test WS", owner_id: "o1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), ilike: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { owner_id: "o1", plan_type: "pro", status: "active" }, error: null }) } as any);
  });

  it("creates an invite", async () => {
    vi.mocked(checkIfEmailIsMember).mockResolvedValue(null);
    vi.mocked(checkIfInviteIsPending).mockResolvedValue(false);
    vi.mocked(createWorkspaceInvite).mockResolvedValue({ id: "i1", token: "tok" } as any);
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    vi.mocked(sendWorkspaceInviteEmail).mockResolvedValue({ success: true });
    expect((await createInviteAction("ws-1", "a@b.com", "editor")).inviteLink).toContain("https://example.com/invite/tok");
  });

  it("rejects invalid email", async () => {
    await expect(createInviteAction("ws-1", "bad-email", "editor")).rejects.toThrow("valid email");
  });
});

describe("acceptInviteAction", () => {
  it("accepts when email matches", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } as any, supabase: {} as any });
    vi.mocked(fetchInviteByToken).mockResolvedValue({ id: "i1", workspace_id: "ws-1", email: "a@b.com", role: "editor", token: "t", status: "pending", workspace_name: "Test", created_at: "" } as any);
    vi.mocked(acceptWorkspaceInvite).mockResolvedValue("ws-1");
    expect(await acceptInviteAction("t")).toBe("ws-1");
  });
  it("rejects if invite not found", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } as any, supabase: {} as any });
    vi.mocked(fetchInviteByToken).mockResolvedValue(null);
    await expect(acceptInviteAction("t")).rejects.toThrow("Invitation is invalid");
  });
});

describe("revokeInviteAction", () => {
  it("revokes an invite", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(revokeWorkspaceInvite).mockResolvedValue(undefined);
    await revokeInviteAction("ws-1", "i1");
    expect(revokeWorkspaceInvite).toHaveBeenCalledWith("ws-1", "i1");
  });
});

describe("rejectInviteAction", () => {
  it("rejects an invite", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(rejectWorkspaceInvite).mockResolvedValue("ws-1");
    await rejectInviteAction("t");
    expect(rejectWorkspaceInvite).toHaveBeenCalledWith("t", "u1");
  });
});

describe("searchProfilesAction", () => {
  it("searches profiles by email", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(searchProfilesByEmail).mockResolvedValue([{ id: "1", email: "a@b.com" }] as any);
    expect(await searchProfilesAction("test")).toEqual([{ id: "1", email: "a@b.com" }]);
  });
});

describe("bulkInviteUsersAction", () => {
  it("invites multiple valid users", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "inviter@a.com" } as any, supabase: {} as any });
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", name: "Test" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), ilike: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { owner_id: "o1", plan_type: "pro", status: "active" }, error: null }) } as any);
    vi.mocked(checkIfEmailIsMember).mockResolvedValue(null);
    vi.mocked(checkIfInviteIsPending).mockResolvedValue(false);
    vi.mocked(bulkCreateWorkspaceInvites).mockResolvedValue([{ id: "i1", token: "t1", email: "a@b.com" }, { id: "i2", token: "t2", email: "c@d.com" }] as any);
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    vi.mocked(sendWorkspaceInviteEmail).mockResolvedValue({ success: true });
    expect((await bulkInviteUsersAction("ws-1", ["a@b.com", "c@d.com"], "editor")).successfulEmails).toHaveLength(2);
  });
});
