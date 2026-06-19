import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { fetchProfileById, searchProfilesByEmail, updateProfile, deleteProfile } from "@/services/profile";

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
    ilike: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
  };
  b.from.mockReturnValue(b);
  b.select.mockReturnValue(b);
  b.insert.mockReturnValue(b);
  b.update.mockReturnValue(b);
  b.delete.mockReturnValue(b);
  b.eq.mockReturnValue(b);
  b.ilike.mockReturnValue(b);
  b.limit.mockReturnValue(b);
  b.single.mockResolvedValue({ data: null, error: null });
  return b;
}

describe("fetchProfileById", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns profile on success", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    const profile = { id: "user-1", email: "test@example.com", name: "Test", avatar_url: null, created_at: "", updated_at: "" };
    b.single.mockResolvedValue({ data: profile, error: null });

    expect(await fetchProfileById("user-1")).toEqual(profile);
    expect(b.from).toHaveBeenCalledWith("profiles");
    expect(b.eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("returns null on PGRST116 error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    expect(await fetchProfileById("user-1")).toBeNull();
  });

  it("returns null on other error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { code: "OTHER", message: "fail" } });
    expect(await fetchProfileById("user-1")).toBeNull();
  });
});

describe("searchProfilesByEmail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array for short query", async () => {
    expect(await searchProfilesByEmail("a")).toEqual([]);
  });

  it("returns empty array for empty query", async () => {
    expect(await searchProfilesByEmail("")).toEqual([]);
  });

  it("returns matching profiles", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    const profiles = [{ id: "1", email: "test@example.com", name: "Test" }];
    b.limit = vi.fn().mockResolvedValue({ data: profiles, error: null });

    expect(await searchProfilesByEmail("test")).toEqual(profiles);
    expect(b.from).toHaveBeenCalledWith("profiles");
    expect(b.ilike).toHaveBeenCalledWith("email", "%test%");
    expect(b.limit).toHaveBeenCalledWith(5);
  });

  it("returns empty array on error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.limit = vi.fn().mockResolvedValue({ data: null, error: { message: "Error" } });
    expect(await searchProfilesByEmail("test")).toEqual([]);
  });
});

describe("updateProfile", () => {
  it("updates and returns profile", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "user-1", name: "Updated" }, error: null });

    expect(await updateProfile("user-1", { name: "Updated" })).toEqual({ id: "user-1", name: "Updated" });
    expect(b.update).toHaveBeenCalledWith({ name: "Updated" });
    expect(b.eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("throws on error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { message: "Update failed" } });
    await expect(updateProfile("user-1", { name: "Test" })).rejects.toThrow("Update failed");
  });
});

describe("deleteProfile", () => {
  it("deletes user auth and profile", async () => {
    const adminDb = { auth: { admin: { deleteUser: vi.fn().mockResolvedValue({ error: null }) } } };
    vi.mocked(createAdminClient).mockReturnValue(adminDb as any);

    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq.mockReturnValue(terminal());

    await deleteProfile("user-1");
    expect(adminDb.auth.admin.deleteUser).toHaveBeenCalledWith("user-1");
    expect(b.from).toHaveBeenCalledWith("profiles");
    expect(b.delete).toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith("id", "user-1");
  });

  it("throws on auth deletion error", async () => {
    const adminDb = { auth: { admin: { deleteUser: vi.fn().mockResolvedValue({ error: { message: "Admin delete failed" } }) } } };
    vi.mocked(createAdminClient).mockReturnValue(adminDb as any);
    await expect(deleteProfile("user-1")).rejects.toThrow("Admin delete failed");
  });
});
