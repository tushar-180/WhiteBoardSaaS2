import { describe, it, expect, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({ requireActionAuth: vi.fn(), createAdminClient: vi.fn() }));
vi.mock("@/services/profile", () => ({ updateProfile: vi.fn(), deleteProfile: vi.fn(), fetchProfileById: vi.fn() }));

import { requireActionAuth, createAdminClient } from "@/utils/supabase/server";
import { updateProfile, deleteProfile, fetchProfileById } from "@/services/profile";
import { updateProfileAction, uploadAvatarAction, deleteAccountAction } from "@/actions/profile";

describe("updateProfileAction", () => {
  it("updates the profile name and rejects short names", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } as any, supabase: {} as any });
    vi.mocked(updateProfile).mockResolvedValue({ id: "u1", name: "New Name" } as any);
    expect((await updateProfileAction({ name: "New Name" })).name).toBe("New Name");
    await expect(updateProfileAction({ name: "A" })).rejects.toThrow("at least 2 characters");
  });
});

describe("uploadAvatarAction", () => {
  it("uploads avatar and updates profile", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    const fd = new FormData();
    fd.append("file", new File(["test"], "avatar.png", { type: "image/png" }));
    vi.mocked(createAdminClient).mockReturnValue({ storage: { from: vi.fn().mockReturnThis(), upload: vi.fn().mockResolvedValue({ error: null }), getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/avatar.png" } }) } } as any);
    vi.mocked(fetchProfileById).mockResolvedValue({ id: "u1", avatar_url: null } as any);
    vi.mocked(updateProfile).mockResolvedValue({ id: "u1", avatar_url: "https://example.com/avatar.png" } as any);
    expect((await uploadAvatarAction(fd)).avatar_url).toBe("https://example.com/avatar.png");
  });

  it("rejects missing file", async () => {
    await expect(uploadAvatarAction(new FormData())).rejects.toThrow("No file provided");
  });
});

describe("deleteAccountAction", () => {
  it("deletes account when email matches", async () => {
    const mockSupabase = { auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } };
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } as any, supabase: mockSupabase as any });
    vi.mocked(deleteProfile).mockResolvedValue(undefined);
    await deleteAccountAction("a@b.com");
    expect(deleteProfile).toHaveBeenCalledWith("u1");
  });

  it("throws when email does not match", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } as any, supabase: {} as any });
    await expect(deleteAccountAction("wrong@b.com")).rejects.toThrow("Email does not match");
  });
});
