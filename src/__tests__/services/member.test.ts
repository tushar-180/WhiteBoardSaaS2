import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "@/utils/supabase/server";
import { fetchWorkspaceMembers, fetchWorkspaceMemberRole, checkIfEmailIsMember, addWorkspaceMember, removeWorkspaceMember, updateWorkspaceMemberRole, bulkRemoveWorkspaceMembers } from "@/services/member";

function terminal(v: any = { error: null, data: null }) { return { then: (r: Function) => r(v), catch: () => {} }; }
function b() {
  const x: any = { from: vi.fn(), select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), in: vi.fn(), single: vi.fn() };
  x.from.mockReturnValue(x); x.select.mockReturnValue(x); x.insert.mockReturnValue(x); x.update.mockReturnValue(x); x.delete.mockReturnValue(x); x.eq.mockReturnValue(x); x.in.mockReturnValue(x);
  x.single.mockResolvedValue({ data: null, error: null }); return x;
}

describe("fetchWorkspaceMembers", () => {
  it("returns members with profile data", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValue(terminal({ data: [{ id: "m1", workspace_id: "ws-1", user_id: "u1", joined_at: "", role: "editor", profiles: { email: "a@b.com", name: "T", avatar_url: null } }], error: null }));
    expect((await fetchWorkspaceMembers("ws-1"))[0].email).toBe("a@b.com");
  });
  it("handles null profile", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValue(terminal({ data: [{ id: "m1", workspace_id: "ws-1", user_id: "u1", joined_at: "", role: "viewer", profiles: null }], error: null }));
    expect((await fetchWorkspaceMembers("ws-1"))[0].email).toBe("");
  });
});

describe("fetchWorkspaceMemberRole", () => {
  it("returns role or null", async () => {
    const x1 = b(); vi.mocked(createClient).mockResolvedValue(x1);
    x1.single.mockResolvedValue({ data: { role: "admin" }, error: null });
    expect(await fetchWorkspaceMemberRole("ws-1", "u1")).toBe("admin");
    const x2 = b(); vi.mocked(createClient).mockResolvedValue(x2);
    x2.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    expect(await fetchWorkspaceMemberRole("ws-1", "u1")).toBeNull();
  });
});

describe("checkIfEmailIsMember", () => {
  it("returns role if email is a member, null otherwise", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValueOnce({ data: { id: "u1" }, error: null }).mockResolvedValueOnce({ data: { role: "editor" }, error: null });
    expect(await checkIfEmailIsMember("ws-1", "a@b.com")).toBe("editor");
  });
});

describe("addWorkspaceMember", () => {
  it("adds a member", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "m1" }, error: null });
    expect((await addWorkspaceMember("ws-1", "u1", "editor")).id).toBe("m1");
  });
});

describe("removeWorkspaceMember", () => {
  it("removes a member", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValueOnce(x).mockReturnValueOnce(terminal());
    await removeWorkspaceMember("ws-1", "m1");
    expect(x.delete).toHaveBeenCalled();
  });
});

describe("updateWorkspaceMemberRole", () => {
  it("updates a member's role", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "m1", role: "admin" }, error: null });
    x.eq.mockReturnValueOnce(x).mockReturnValueOnce(x);
    expect((await updateWorkspaceMemberRole("ws-1", "m1", "admin")).role).toBe("admin");
  });
});

describe("bulkRemoveWorkspaceMembers", () => {
  it("removes multiple members", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValue(x); x.in.mockReturnValue(terminal());
    await bulkRemoveWorkspaceMembers("ws-1", ["m1", "m2"]);
    expect(x.in).toHaveBeenCalledWith("id", ["m1", "m2"]);
  });
});
