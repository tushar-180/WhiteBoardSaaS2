import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn(), createAdminClient: vi.fn() }));

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { fetchProfileById, searchProfilesByEmail, updateProfile, deleteProfile } from "@/services/profile";

function terminal(v: any = { error: null, data: null }) { return { then: (r: Function) => r(v), catch: () => {} }; }
function b() {
  const x: any = { from: vi.fn(), select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), ilike: vi.fn(), limit: vi.fn(), single: vi.fn() };
  x.from.mockReturnValue(x); x.select.mockReturnValue(x); x.insert.mockReturnValue(x); x.update.mockReturnValue(x); x.delete.mockReturnValue(x); x.eq.mockReturnValue(x); x.ilike.mockReturnValue(x); x.limit.mockReturnValue(x);
  x.single.mockResolvedValue({ data: null, error: null }); return x;
}

describe("fetchProfileById", () => {
  it("returns profile on success", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "u1", email: "a@b.com" }, error: null });
    expect((await fetchProfileById("u1"))?.email).toBe("a@b.com");
  });
  it("returns null on error", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: null, error: { code: "OTHER" } });
    expect(await fetchProfileById("u1")).toBeNull();
  });
});

describe("searchProfilesByEmail", () => {
  it("returns empty for short query and results for valid query", async () => {
    expect(await searchProfilesByEmail("a")).toEqual([]);
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.limit.mockResolvedValue({ data: [{ id: "1", email: "test@example.com" }], error: null });
    const r = await searchProfilesByEmail("test");
    expect(r).toHaveLength(1);
    expect(x.ilike).toHaveBeenCalledWith("email", "%test%");
  });
});

describe("updateProfile", () => {
  it("updates and returns profile", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "u1", name: "Updated" }, error: null });
    expect(await updateProfile("u1", { name: "Updated" })).toEqual({ id: "u1", name: "Updated" });
  });
});

describe("deleteProfile", () => {
  it("deletes user auth and profile", async () => {
    const admin = { auth: { admin: { deleteUser: vi.fn().mockResolvedValue({ error: null }) } } };
    vi.mocked(createAdminClient).mockReturnValue(admin as any);
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValue(terminal());
    await deleteProfile("u1");
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith("u1");
  });
});
