import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import {
  fetchInviteByToken,
  checkIfInviteIsPending,
  createWorkspaceInvite,
  acceptWorkspaceInvite,
  revokeWorkspaceInvite,
  rejectWorkspaceInvite,
  fetchPendingInvitesByWorkspace,
  dismissInviteNotification,
  bulkRevokeWorkspaceInvites,
  bulkCreateWorkspaceInvites,
} from "@/services/invite";

function terminal(resolveValue = { error: null, data: null }) {
  return { then: (resolve: Function) => resolve(resolveValue), catch: () => {} };
}

function buildClient() {
  const b: any = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    single: vi.fn(),
  };
  b.from.mockReturnValue(b);
  b.select.mockReturnValue(b);
  b.insert.mockReturnValue(b);
  b.update.mockReturnValue(b);
  b.delete.mockReturnValue(b);
  b.eq.mockReturnValue(b);
  b.in.mockReturnValue(b);
  b.single.mockResolvedValue({ data: null, error: null });
  return b;
}

describe("fetchInviteByToken", () => {
  it("returns invite with workspace name", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single
      .mockResolvedValueOnce({ data: { id: "inv-1", workspace_id: "ws-1", email: "a@b.com", token: "tok", status: "pending", created_by: "u1", accepted_by: null, role: "editor", created_at: "" }, error: null })
      .mockResolvedValueOnce({ data: { name: "Test WS" }, error: null });

    const result = await fetchInviteByToken("tok");
    expect(result).toBeTruthy();
    expect(result!.workspace_name).toBe("Test WS");
    expect(result!.role).toBe("editor");
  });

  it("returns null for PGRST116 error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });
    expect(await fetchInviteByToken("tok")).toBeNull();
  });

  it("returns null for other error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: null, error: { code: "OTHER" } });
    expect(await fetchInviteByToken("tok")).toBeNull();
  });
});

describe("checkIfInviteIsPending", () => {
  it("returns true when pending invite exists", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "inv-1" }, error: null });
    expect(await checkIfInviteIsPending("ws-1", "test@example.com")).toBe(true);
  });

  it("returns false when no pending invite", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    expect(await checkIfInviteIsPending("ws-1", "test@example.com")).toBe(false);
  });

  it("normalizes email case", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    await checkIfInviteIsPending("ws-1", "TEST@EXAMPLE.COM");
    expect(b.eq).toHaveBeenCalledWith("email", "test@example.com");
  });
});

describe("createWorkspaceInvite", () => {
  it("creates an invite with a token", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    const mockInvite = { id: "inv-1", workspace_id: "ws-1", email: "test@example.com", token: expect.any(String), status: "pending", created_by: "user-1", role: "editor" };
    b.single.mockResolvedValue({ data: mockInvite, error: null });

    const result = await createWorkspaceInvite("ws-1", "test@example.com", "editor", "user-1");
    expect(result).toEqual(mockInvite);
    expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({ email: "test@example.com", role: "editor", status: "pending" }));
  });
});

describe("acceptWorkspaceInvite", () => {
  it("accepts a pending invite and adds member", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single
      .mockResolvedValueOnce({ data: { id: "inv-1", workspace_id: "ws-1", role: "editor", status: "pending" }, error: null })
      .mockResolvedValueOnce({ data: { id: "member-1" }, error: null });

    const result = await acceptWorkspaceInvite("tok", "user-1");
    expect(result).toBe("ws-1");
  });

  it("throws for revoked invites", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single
      .mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } })
      .mockResolvedValueOnce({ data: { status: "revoked" }, error: null });

    await expect(acceptWorkspaceInvite("tok", "user-1")).rejects.toThrow("revoked");
  });
});

describe("revokeWorkspaceInvite", () => {
  it("sets invite status to revoked", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq
      .mockReturnValueOnce(b) // first eq returns builder for chaining
      .mockReturnValueOnce(terminal()); // second eq returns thenable

    await revokeWorkspaceInvite("ws-1", "inv-1");
    expect(b.update).toHaveBeenCalledWith({ status: "revoked" });
  });
});

describe("rejectWorkspaceInvite", () => {
  it("rejects an invite", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: { id: "inv-1", workspace_id: "ws-1", status: "pending" }, error: null });
    // Chain: .select().eq("token").eq("status").single() - eq needs to return b for chaining, then single() resolves
    b.eq.mockReturnValue(b);

    const result = await rejectWorkspaceInvite("tok", "user-1");
    expect(result).toBe("ws-1");
  });
});

describe("fetchPendingInvitesByWorkspace", () => {
  it("fetches pending invites", async () => {
    const mockInvites = [{ id: "inv-1", status: "pending" }];
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    // Chain: .select().eq("wid").eq("status") - last eq must be terminal
    b.eq.mockReturnValueOnce(b).mockReturnValueOnce(terminal({ data: mockInvites, error: null }));

    const result = await fetchPendingInvitesByWorkspace("ws-1");
    expect(result).toEqual(mockInvites);
  });
});

describe("dismissInviteNotification", () => {
  it("marks invite as seen by inviter", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq
      .mockReturnValueOnce(b)  // first eq: "id", inviteId
      .mockReturnValueOnce(terminal()); // second eq: "created_by", userId

    await dismissInviteNotification("inv-1", "user-1");
    expect(b.update).toHaveBeenCalledWith({ inviter_seen: true });
  });
});

describe("bulkRevokeWorkspaceInvites", () => {
  it("does nothing with empty array", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    await bulkRevokeWorkspaceInvites("ws-1", []);
    expect(b.update).not.toHaveBeenCalled();
  });
});

describe("bulkCreateWorkspaceInvites", () => {
  it("creates multiple invites", async () => {
    const invite1 = { id: "inv-1", email: "a@b.com" };
    const invite2 = { id: "inv-2", email: "c@d.com" };
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.select.mockResolvedValue({ data: [invite1, invite2], error: null });

    const result = await bulkCreateWorkspaceInvites("ws-1", ["a@b.com", "c@d.com"], "editor", "user-1");
    expect(result).toEqual([invite1, invite2]);
    expect(b.insert).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ email: "a@b.com" }),
      expect.objectContaining({ email: "c@d.com" }),
    ]));
  });

  it("returns empty array for empty emails", async () => {
    expect(await bulkCreateWorkspaceInvites("ws-1", [], "editor", "user-1")).toEqual([]);
  });
});
