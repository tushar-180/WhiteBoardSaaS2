import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  requireActionAuth: vi.fn(),
  createAdminClient: vi.fn(),
}));

vi.mock("@/services/profile", () => ({
  updateProfile: vi.fn(),
  deleteProfile: vi.fn(),
}));

import { requireActionAuth, createAdminClient } from "@/utils/supabase/server";
import { updateProfile, deleteProfile } from "@/services/profile";
import { updateProfileAction, uploadAvatarAction, deleteAccountAction } from "@/actions/profile";

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" } as any,
      supabase: {} as any,
    });
  });

  it("updates the profile name", async () => {
    const mockProfile = { id: "user-1", email: "test@example.com", name: "New Name", avatar_url: null, created_at: "", updated_at: "" };
    vi.mocked(updateProfile).mockResolvedValue(mockProfile);

    const result = await updateProfileAction({ name: "New Name" });
    expect(result).toEqual(mockProfile);
    expect(updateProfile).toHaveBeenCalledWith("user-1", { name: "New Name" });
  });

  it("rejects short names", async () => {
    await expect(updateProfileAction({ name: "A" })).rejects.toThrow("at least 2 characters");
  });

  it("rejects long names", async () => {
    await expect(updateProfileAction({ name: "A".repeat(51) })).rejects.toThrow("under 50 characters");
  });

  it("requires auth", async () => {
    vi.mocked(requireActionAuth).mockRejectedValue(new Error("You must be logged in"));
    await expect(updateProfileAction({ name: "Test" })).rejects.toThrow("You must be logged in");
  });
});

describe("uploadAvatarAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" } as any,
      supabase: {} as any,
    });
  });

  it("requires a file", async () => {
    const formData = new FormData();
    await expect(uploadAvatarAction(formData)).rejects.toThrow("No file provided");
  });

  it("uploads avatar and updates profile", async () => {
    const mockFile = new File(["test"], "avatar.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", mockFile);

    const adminClient = {
      storage: {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/avatar.png" } }),
      },
    };
    vi.mocked(createAdminClient).mockReturnValue(adminClient as any);

    const mockProfile = { id: "user-1", avatar_url: "https://example.com/avatar.png" };
    vi.mocked(updateProfile).mockResolvedValue(mockProfile as any);

    const result = await uploadAvatarAction(formData);
    expect(result).toEqual(mockProfile);
    expect(updateProfile).toHaveBeenCalledWith("user-1", { avatar_url: "https://example.com/avatar.png" });
  });
});

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes account when email matches", async () => {
    const mockSupabase = {
      auth: { signOut: vi.fn().mockResolvedValue({ error: null }) },
    };
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" } as any,
      supabase: mockSupabase as any,
    });
    vi.mocked(deleteProfile).mockResolvedValue(undefined);

    await deleteAccountAction("test@example.com");
    expect(deleteProfile).toHaveBeenCalledWith("user-1");
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it("throws when email does not match", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" } as any,
      supabase: {} as any,
    });

    await expect(deleteAccountAction("wrong@example.com")).rejects.toThrow(
      "Email does not match your account email",
    );
  });
});
