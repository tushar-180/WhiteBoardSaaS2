import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/utils/supabase/server";
import { fetchInviteByToken, checkIfInviteIsPending, createWorkspaceInvite, acceptWorkspaceInvite, rejectWorkspaceInvite, revokeWorkspaceInvite } from "@/services/invite";

function terminal(v: any = { error: null, data: null }) { return { then: (r: Function) => r(v), catch: () => {} }; }
function b() {
  const x: any = { from: vi.fn(), select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), in: vi.fn(), single: vi.fn() };
  x.from.mockReturnValue(x); x.select.mockReturnValue(x); x.insert.mockReturnValue(x); x.update.mockReturnValue(x); x.delete.mockReturnValue(x); x.eq.mockReturnValue(x); x.in.mockReturnValue(x);
  x.single.mockResolvedValue({ data: null, error: null }); return x;
}

describe("fetchInviteByToken", () => {
  it("returns invite with workspace name", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValueOnce({ data: { id: "i1", workspace_id: "ws-1", email: "a@b.com", token: "t", status: "pending", created_by: "u1", accepted_by: null, role: "editor", created_at: "" }, error: null })
      .mockResolvedValueOnce({ data: { name: "Test WS" }, error: null });
    expect((await fetchInviteByToken("t"))?.workspace_name).toBe("Test WS");
  });
  it("returns null on PGRST116", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });
    expect(await fetchInviteByToken("t")).toBeNull();
  });
});

describe("checkIfInviteIsPending", () => {
  it("returns true when pending exists, false otherwise", async () => {
    const x1 = b(); vi.mocked(createClient).mockResolvedValue(x1);
    x1.single.mockResolvedValue({ data: { id: "i1" }, error: null });
    expect(await checkIfInviteIsPending("ws-1", "a@b.com")).toBe(true);
    const x2 = b(); vi.mocked(createClient).mockResolvedValue(x2);
    x2.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    expect(await checkIfInviteIsPending("ws-1", "a@b.com")).toBe(false);
  });
});

describe("createWorkspaceInvite", () => {
  it("creates an invite with a token", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "i1", workspace_id: "ws-1", email: "a@b.com", token: expect.any(String), status: "pending", created_by: "u1", role: "editor" }, error: null });
    expect((await createWorkspaceInvite("ws-1", "a@b.com", "editor", "u1")).id).toBe("i1");
  });
});

describe("acceptWorkspaceInvite", () => {
  it("accepts a pending invite and adds member", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValueOnce({ data: { id: "i1", workspace_id: "ws-1", role: "editor", status: "pending" }, error: null })
      .mockResolvedValueOnce({ data: { id: "m1" }, error: null });
    expect(await acceptWorkspaceInvite("t", "u1")).toBe("ws-1");
  });
  it("throws for revoked invites", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } }).mockResolvedValueOnce({ data: { status: "revoked" }, error: null });
    await expect(acceptWorkspaceInvite("t", "u1")).rejects.toThrow("revoked");
  });
});

describe("rejectWorkspaceInvite", () => {
  it("rejects an invite", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValueOnce({ data: { id: "i1", workspace_id: "ws-1", status: "pending" }, error: null });
    x.eq.mockReturnValue(x);
    expect(await rejectWorkspaceInvite("t", "u1")).toBe("ws-1");
  });
});

describe("revokeWorkspaceInvite", () => {
  it("sets invite status to revoked", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValueOnce(x).mockReturnValueOnce(terminal());
    await revokeWorkspaceInvite("ws-1", "i1");
    expect(x.update).toHaveBeenCalledWith({ status: "revoked" });
  });
});
