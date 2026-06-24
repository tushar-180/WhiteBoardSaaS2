import { describe, it, expect, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({ requireActionAuth: vi.fn(), createAdminClient: vi.fn() }));
vi.mock("@/services/profile", () => ({ fetchProfileById: vi.fn() }));
vi.mock("@/services/workspace", () => ({ fetchAllUserWorkspaces: vi.fn() }));
vi.mock("@/services/billing", () => ({ getUserSubscription: vi.fn(), getUserPayments: vi.fn() }));

import { requireActionAuth, createAdminClient } from "@/utils/supabase/server";
import { fetchProfileById } from "@/services/profile";
import { fetchAllUserWorkspaces } from "@/services/workspace";
import { getUserSubscription, getUserPayments } from "@/services/billing";
import { getSettingsDataAction, getUserSubscriptionAction, cancelSubscriptionAction, getUserPaymentsAction } from "@/actions/settings";

describe("getSettingsDataAction", () => {
  it("returns profile and workspaces; handles missing profile", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "test@example.com" } as any, supabase: {} as any });
    vi.mocked(fetchProfileById).mockResolvedValue({ id: "u1", name: "John", email: "test@example.com", avatar_url: null } as any);
    vi.mocked(fetchAllUserWorkspaces).mockResolvedValue([{ id: "ws-1" }] as any);
    expect((await getSettingsDataAction()).user.name).toBe("John");
    vi.mocked(fetchProfileById).mockResolvedValue(null);
    expect((await getSettingsDataAction()).user.name).toBe("test");
  });
});

describe("getUserSubscriptionAction", () => {
  it("returns subscription details", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(getUserSubscription).mockResolvedValue({ user_id: "u1", plan_type: "pro", status: "active", current_period_end: "", created_at: "", updated_at: "" });
    expect((await getUserSubscriptionAction()).plan_type).toBe("pro");
  });
});

describe("cancelSubscriptionAction", () => {
  it("cancels a paid subscription and downgrades to free", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    const admin = { from: vi.fn().mockReturnThis(), select: vi.fn().mockImplementation(() => ({ eq: vi.fn().mockImplementation(() => ({ single: vi.fn().mockResolvedValue({ data: { plan_type: "pro" }, error: null }) }) ) })), eq: vi.fn().mockResolvedValue({ error: null }), update: vi.fn().mockReturnThis() };
    vi.mocked(createAdminClient).mockReturnValue(admin as any);
    await cancelSubscriptionAction();
    expect(admin.update).toHaveBeenCalledWith(expect.objectContaining({ plan_type: "free", status: "expired" }));
  });
  it("throws if already on free plan", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    const admin = { from: vi.fn().mockReturnThis(), select: vi.fn().mockImplementation(() => ({ eq: vi.fn().mockImplementation(() => ({ single: vi.fn().mockResolvedValue({ data: { plan_type: "free" }, error: null }) }) ) })), eq: vi.fn().mockResolvedValue({ error: null }), update: vi.fn().mockReturnThis() };
    vi.mocked(createAdminClient).mockReturnValue(admin as any);
    await expect(cancelSubscriptionAction()).rejects.toThrow("already on the Free plan");
  });
});

describe("getUserPaymentsAction", () => {
  it("returns user payment history", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(getUserPayments).mockResolvedValue([{ id: "p1", amount: 49900 }] as any);
    expect((await getUserPaymentsAction())).toHaveLength(1);
  });
});
