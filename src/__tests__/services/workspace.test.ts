import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/utils", () => ({ isValidUUID: vi.fn() }));

import { createClient } from "@/utils/supabase/server";
import { isValidUUID } from "@/lib/utils";
import { fetchWorkspaceById, hasWorkspaceAccess, insertWorkspace, deleteWorkspace, bulkDeleteWorkspaces } from "@/services/workspace";

function terminal(v: any = { error: null, data: null }) { return { then: (r: Function) => r(v), catch: () => {} }; }
function b() {
  const x: any = { from: vi.fn(), select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), in: vi.fn(), neq: vi.fn(), ilike: vi.fn(), order: vi.fn(), limit: vi.fn(), single: vi.fn(), maybeSingle: vi.fn() };
  x.from.mockReturnValue(x); x.select.mockReturnValue(x); x.insert.mockReturnValue(x); x.update.mockReturnValue(x); x.delete.mockReturnValue(x); x.eq.mockReturnValue(x); x.in.mockReturnValue(x); x.neq.mockReturnValue(x); x.ilike.mockReturnValue(x); x.order.mockReturnValue(x); x.limit.mockReturnValue(x);
  x.single.mockResolvedValue({ data: null, error: null }); x.maybeSingle.mockResolvedValue({ data: null, error: null }); return x;
}

describe("fetchWorkspaceById", () => {
  it("returns null for invalid UUID", async () => {
    vi.mocked(isValidUUID).mockReturnValue(false);
    expect(await fetchWorkspaceById("bad")).toBeNull();
  });
  it("returns workspace on success", async () => {
    vi.mocked(isValidUUID).mockReturnValue(true);
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "ws-1", name: "Test" }, error: null });
    expect(await fetchWorkspaceById("uuid")).toEqual({ id: "ws-1", name: "Test" });
  });
});

describe("hasWorkspaceAccess", () => {
  it("returns true for owner and member, false otherwise", async () => {
    const x1 = b(); vi.mocked(createClient).mockResolvedValue(x1);
    x1.single.mockResolvedValueOnce({ data: { owner_id: "u1" }, error: null });
    expect(await hasWorkspaceAccess("ws-1", "u1")).toBe(true);
    const x2 = b(); vi.mocked(createClient).mockResolvedValue(x2);
    x2.single.mockResolvedValueOnce({ data: { owner_id: "u2" }, error: null }).mockResolvedValueOnce({ data: { id: "m1" }, error: null });
    expect(await hasWorkspaceAccess("ws-1", "u1")).toBe(true);
    const x3 = b(); vi.mocked(createClient).mockResolvedValue(x3);
    x3.single.mockResolvedValueOnce({ data: null, error: { message: "not found" } });
    expect(await hasWorkspaceAccess("ws-1", "u1")).toBe(false);
  });
});

describe("insertWorkspace", () => {
  it("creates workspace and member record", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValueOnce({ data: { id: "ws-1", name: "Test" }, error: null });
    expect(await insertWorkspace("Test", "slug", "u1")).toEqual({ id: "ws-1", name: "Test" });
  });
});

describe("deleteWorkspace", () => {
  it("deletes a workspace by id and owner_id", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValueOnce(x).mockReturnValueOnce(terminal());
    await deleteWorkspace("ws-1", "u1");
    expect(x.delete).toHaveBeenCalled();
  });
});

describe("bulkDeleteWorkspaces", () => {
  it("deletes multiple workspaces", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValue(x); x.in.mockReturnValue(terminal());
    await bulkDeleteWorkspaces(["ws-1", "ws-2"], "u1");
    expect(x.in).toHaveBeenCalledWith("id", ["ws-1", "ws-2"]);
  });
});
