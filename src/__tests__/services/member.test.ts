import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import {
  fetchWorkspaceMembers,
  fetchWorkspaceMemberRole,
  checkIfEmailIsMember,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
  bulkRemoveWorkspaceMembers,
  leaveWorkspace,
  bulkLeaveWorkspaces,
} from "@/services/member";

function terminal(resolveValue: any = { error: null, data: null }) {
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

describe("fetchWorkspaceMembers", () => {
  it("returns members with profile data", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    const rows = [{ id: "m-1", workspace_id: "ws-1", user_id: "u-1", joined_at: "2025-01-01", role: "editor", profiles: { email: "test@example.com", name: "Test", avatar_url: null } }];
    // Chain: .select().eq() - last eq must be terminal
    b.eq.mockReturnValue(terminal({ data: rows, error: null }));

    const result = await fetchWorkspaceMembers("ws-1");
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("test@example.com");
    expect(result[0].role).toBe("editor");
  });

  it("handles null profile", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq.mockReturnValue(terminal({ data: [{ id: "m-1", workspace_id: "ws-1", user_id: "u-1", joined_at: "", role: "viewer", profiles: null }], error: null }));

    const result = await fetchWorkspaceMembers("ws-1");
    expect(result[0].email).toBe("");
  });
});

describe("fetchWorkspaceMemberRole", () => {
  it("returns the member's role", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { role: "admin" }, error: null });
    expect(await fetchWorkspaceMemberRole("ws-1", "user-1")).toBe("admin");
  });

  it("returns null when not a member", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    expect(await fetchWorkspaceMemberRole("ws-1", "user-1")).toBeNull();
  });
});

describe("checkIfEmailIsMember", () => {
  it("returns the role if email is a member", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single
      .mockResolvedValueOnce({ data: { id: "user-1" }, error: null })
      .mockResolvedValueOnce({ data: { role: "editor" }, error: null });
    expect(await checkIfEmailIsMember("ws-1", "test@example.com")).toBe("editor");
  });

  it("returns null if email not found in profiles", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });
    expect(await checkIfEmailIsMember("ws-1", "test@example.com")).toBeNull();
  });
});

describe("addWorkspaceMember", () => {
  it("adds a member and returns the record", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "m-1", workspace_id: "ws-1", user_id: "u-1", role: "editor" }, error: null });

    expect(await addWorkspaceMember("ws-1", "u-1", "editor")).toEqual({ id: "m-1", workspace_id: "ws-1", user_id: "u-1", role: "editor" });
  });
});

describe("removeWorkspaceMember", () => {
  it("removes a member", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq
      .mockReturnValueOnce(b)  // first eq: "id", memberId
      .mockReturnValueOnce(terminal()); // second eq: "workspace_id", workspaceId

    await removeWorkspaceMember("ws-1", "m-1");
    expect(b.from).toHaveBeenCalledWith("workspace_members");
    expect(b.delete).toHaveBeenCalled();
  });
});

describe("updateWorkspaceMemberRole", () => {
  it("updates a member's role", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "m-1", role: "admin" }, error: null });
    b.eq
      .mockReturnValueOnce(b)  // "id"
      .mockReturnValueOnce(b); // "workspace_id"

    const result = await updateWorkspaceMemberRole("ws-1", "m-1", "admin");
    expect(result).toEqual({ id: "m-1", role: "admin" });
    expect(b.update).toHaveBeenCalledWith({ role: "admin" });
  });
});

describe("bulkRemoveWorkspaceMembers", () => {
  it("does nothing with empty array", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    await bulkRemoveWorkspaceMembers("ws-1", []);
    expect(b.delete).not.toHaveBeenCalled();
  });

  it("removes multiple members", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq.mockReturnValue(b);
    b.in.mockReturnValue(terminal());

    await bulkRemoveWorkspaceMembers("ws-1", ["m-1", "m-2"]);
    expect(b.delete).toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith("workspace_id", "ws-1");
    expect(b.in).toHaveBeenCalledWith("id", ["m-1", "m-2"]);
  });
});

describe("leaveWorkspace", () => {
  it("removes the user from workspace members", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq
      .mockReturnValueOnce(b)  // workspace_id
      .mockReturnValueOnce(terminal()); // user_id

    await leaveWorkspace("ws-1", "user-1");
    expect(b.delete).toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith("workspace_id", "ws-1");
    expect(b.eq).toHaveBeenCalledWith("user_id", "user-1");
  });
});

describe("bulkLeaveWorkspaces", () => {
  it("does nothing with empty array", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    await bulkLeaveWorkspaces([], "user-1");
    expect(b.delete).not.toHaveBeenCalled();
  });

  it("leaves multiple workspaces", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq.mockReturnValue(b);
    b.in.mockReturnValue(terminal());

    await bulkLeaveWorkspaces(["ws-1", "ws-2"], "user-1");
    expect(b.delete).toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(b.in).toHaveBeenCalledWith("workspace_id", ["ws-1", "ws-2"]);
  });
});
