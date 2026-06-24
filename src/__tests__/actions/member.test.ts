import { describe, it, expect, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({ requireActionAuth: vi.fn() }));
vi.mock("@/services/member", () => ({ fetchWorkspaceMemberRole: vi.fn(), removeWorkspaceMember: vi.fn(), updateWorkspaceMemberRole: vi.fn(), fetchWorkspaceMembers: vi.fn(), bulkRemoveWorkspaceMembers: vi.fn() }));
vi.mock("@/services/workspace", () => ({ fetchWorkspaceById: vi.fn() }));
vi.mock("@/lib/posthog-server", () => ({ getPostHogClient: vi.fn(() => ({ capture: vi.fn() })) }));

import { requireActionAuth } from "@/utils/supabase/server";
import { fetchWorkspaceMemberRole, removeWorkspaceMember, updateWorkspaceMemberRole, fetchWorkspaceMembers, bulkRemoveWorkspaceMembers } from "@/services/member";
import { fetchWorkspaceById } from "@/services/workspace";
import { removeMemberAction, updateMemberRoleAction, leaveWorkspaceAction, bulkRemoveMembersAction } from "@/actions/member";

describe("removeMemberAction", () => {
  it("removes a member; prevents owner removal", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "o1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([{ id: "m1", user_id: "u2", role: "editor" }] as any);
    vi.mocked(removeWorkspaceMember).mockResolvedValue(undefined);
    await removeMemberAction("ws-1", "m1");
    expect(removeWorkspaceMember).toHaveBeenCalledWith("ws-1", "m1");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([{ id: "m1", user_id: "o1", role: "owner" }] as any);
    await expect(removeMemberAction("ws-1", "m1")).rejects.toThrow("owner cannot be removed");
  });
});

describe("updateMemberRoleAction", () => {
  it("updates a member role; prevents admin changes by admin", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "o1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([{ id: "m1", user_id: "u2", role: "editor" }] as any);
    vi.mocked(updateWorkspaceMemberRole).mockResolvedValue({ id: "m1", role: "admin" } as any);
    await updateMemberRoleAction("ws-1", "m1", "admin");
    expect(updateWorkspaceMemberRole).toHaveBeenCalledWith("ws-1", "m1", "admin");
    await expect(updateMemberRoleAction("ws-1", "m1", "owner" as any)).rejects.toThrow("Invalid role");
  });
});

describe("leaveWorkspaceAction", () => {
  it("allows non-owner to leave, prevents owner", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "o1" } as any);
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([{ id: "m1", user_id: "u1", role: "editor" }] as any);
    vi.mocked(removeWorkspaceMember).mockResolvedValue(undefined);
    await leaveWorkspaceAction("ws-1");
    expect(removeWorkspaceMember).toHaveBeenCalledWith("ws-1", "m1");
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "u1" } as any);
    await expect(leaveWorkspaceAction("ws-1")).rejects.toThrow("owner cannot leave");
  });
});

describe("bulkRemoveMembersAction", () => {
  it("filters owner and self from bulk removal", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([{ id: "m1", user_id: "u2", role: "editor" }, { id: "m2", user_id: "u3", role: "owner" }, { id: "m3", user_id: "u1", role: "owner" }] as any);
    vi.mocked(bulkRemoveWorkspaceMembers).mockResolvedValue(undefined);
    await bulkRemoveMembersAction("ws-1", ["m1", "m2", "m3"]);
    expect(bulkRemoveWorkspaceMembers).toHaveBeenCalledWith("ws-1", ["m1"]);
  });
});
