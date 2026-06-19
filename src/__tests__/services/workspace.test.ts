import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  isValidUUID: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { isValidUUID } from "@/lib/utils";
import {
  fetchWorkspaceById,
  hasWorkspaceAccess,
  insertWorkspace,
  deleteWorkspace,
  bulkDeleteWorkspaces,
} from "@/services/workspace";

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
    neq: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
  b.from.mockReturnValue(b);
  b.select.mockReturnValue(b);
  b.insert.mockReturnValue(b);
  b.update.mockReturnValue(b);
  b.delete.mockReturnValue(b);
  b.eq.mockReturnValue(b);
  b.in.mockReturnValue(b);
  b.neq.mockReturnValue(b);
  b.ilike.mockReturnValue(b);
  b.order.mockReturnValue(b);
  b.limit.mockReturnValue(b);
  b.single.mockResolvedValue({ data: null, error: null });
  b.maybeSingle.mockResolvedValue({ data: null, error: null });
  return b;
}

describe("fetchWorkspaceById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isValidUUID).mockReturnValue(true);
  });

  it("returns null for invalid UUID", async () => {
    vi.mocked(isValidUUID).mockReturnValue(false);
    expect(await fetchWorkspaceById("invalid-uuid")).toBeNull();
  });

  it("returns workspace data on success", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "ws-1", name: "Test", slug: "test", owner_id: "user-1" }, error: null });
    expect(await fetchWorkspaceById("uuid")).toEqual({ id: "ws-1", name: "Test", slug: "test", owner_id: "user-1" });
    expect(b.from).toHaveBeenCalledWith("workspaces");
    expect(b.select).toHaveBeenCalledWith("*");
    expect(b.eq).toHaveBeenCalledWith("id", "uuid");
  });

  it("returns null on error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { code: "SOME_ERROR", message: "fail" } });
    expect(await fetchWorkspaceById("uuid")).toBeNull();
  });

  it("handles PGRST116 error silently", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { code: "PGRST116", message: "not found" } });
    expect(await fetchWorkspaceById("uuid")).toBeNull();
  });
});

describe("hasWorkspaceAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true when user is the workspace owner", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: { owner_id: "user-1" }, error: null });
    expect(await hasWorkspaceAccess("ws-1", "user-1")).toBe(true);
  });

  it("returns true when user is a member", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: { owner_id: "user-2" }, error: null }).mockResolvedValueOnce({ data: { id: "member-1" }, error: null });
    expect(await hasWorkspaceAccess("ws-1", "user-1")).toBe(true);
  });

  it("returns false when workspace not found", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: null, error: { message: "not found" } });
    expect(await hasWorkspaceAccess("ws-1", "user-1")).toBe(false);
  });

  it("returns false when user is not owner or member", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: { owner_id: "user-2" }, error: null }).mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });
    expect(await hasWorkspaceAccess("ws-1", "user-1")).toBe(false);
  });
});

describe("insertWorkspace", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates workspace and member record", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: { id: "ws-1", name: "Test", slug: "test-abc1", owner_id: "user-1" }, error: null });
    expect(await insertWorkspace("Test", "test-abc1", "user-1")).toEqual({ id: "ws-1", name: "Test", slug: "test-abc1", owner_id: "user-1" });
    expect(b.from).toHaveBeenCalledWith("workspaces");
    expect(b.from).toHaveBeenCalledWith("workspace_members");
  });

  it("rolls back workspace if member insert fails", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValueOnce({ data: { id: "ws-1" }, error: null });
    // First insert (workspace): returns b for .select().single() chaining
    // Second insert (member): returns thenable with error (just .insert(), no .select())
    b.insert
      .mockReturnValueOnce(b)
      .mockReturnValueOnce(terminal({ error: { message: "Member insert failed" }, data: null }));

    await expect(insertWorkspace("Test", "test-abc1", "user-1")).rejects.toThrow("Member insert failed");
    expect(b.delete).toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith("id", "ws-1");
  });
});

describe("deleteWorkspace", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a workspace by id and owner_id", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    // Chain: .delete().eq().eq() - last .eq() needs to be thenable
    b.eq.mockReturnValueOnce(b).mockReturnValueOnce(terminal());

    await deleteWorkspace("ws-1", "user-1");
    expect(b.from).toHaveBeenCalledWith("workspaces");
    expect(b.delete).toHaveBeenCalled();
  });

  it("throws on error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq.mockReturnValueOnce(b).mockReturnValueOnce(terminal({ error: { message: "Delete failed" }, data: null }));
    await expect(deleteWorkspace("ws-1", "user-1")).rejects.toThrow("Delete failed");
  });
});

describe("bulkDeleteWorkspaces", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does nothing with empty array", async () => {
    await bulkDeleteWorkspaces([], "user-1");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("deletes multiple workspaces", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    // Chain: .delete().eq().in() - last .in() needs to be thenable
    b.eq.mockReturnValue(b); // .eq returns builder for chaining
    b.in.mockReturnValue(terminal()); // .in returns thenable

    await bulkDeleteWorkspaces(["ws-1", "ws-2"], "user-1");
    expect(b.from).toHaveBeenCalledWith("workspaces");
    expect(b.delete).toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith("owner_id", "user-1");
    expect(b.in).toHaveBeenCalledWith("id", ["ws-1", "ws-2"]);
  });
});
