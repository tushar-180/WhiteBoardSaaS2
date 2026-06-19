import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  requireActionAuth: vi.fn(),
}));

vi.mock("@/services/member", () => ({
  fetchWorkspaceMemberRole: vi.fn(),
  removeWorkspaceMember: vi.fn(),
  updateWorkspaceMemberRole: vi.fn(),
  fetchWorkspaceMembers: vi.fn(),
  bulkRemoveWorkspaceMembers: vi.fn(),
}));

vi.mock("@/services/workspace", () => ({
  fetchWorkspaceById: vi.fn(),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn(() => ({
    capture: vi.fn(),
  })),
}));

import { requireActionAuth } from "@/utils/supabase/server";
import { fetchWorkspaceMemberRole, removeWorkspaceMember, updateWorkspaceMemberRole, fetchWorkspaceMembers, bulkRemoveWorkspaceMembers } from "@/services/member";
import { fetchWorkspaceById } from "@/services/workspace";
import {
  removeMemberAction,
  updateMemberRoleAction,
  leaveWorkspaceAction,
  bulkRemoveMembersAction,
} from "@/actions/member";

describe("removeMemberAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
  });

  it("removes a member with proper permissions", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-2", role: "editor" },
    ] as any);
    vi.mocked(removeWorkspaceMember).mockResolvedValue(undefined);

    await removeMemberAction("ws-1", "m-1");
    expect(removeWorkspaceMember).toHaveBeenCalledWith("ws-1", "m-1");
  });

  it("prevents removing the workspace owner", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("admin");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "owner-1", role: "owner" },
    ] as any);

    await expect(removeMemberAction("ws-1", "m-1")).rejects.toThrow(
      "The workspace owner cannot be removed",
    );
  });

  it("prevents admin from removing another admin", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("admin");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-2", role: "admin" },
    ] as any);

    await expect(removeMemberAction("ws-1", "m-1")).rejects.toThrow(
      "Administrators cannot remove other administrators",
    );
  });

  it("prevents removing yourself", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("admin");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-1", role: "editor" },
    ] as any);

    await expect(removeMemberAction("ws-1", "m-1")).rejects.toThrow(
      "You cannot remove yourself",
    );
  });
});

describe("updateMemberRoleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
  });

  it("updates a member role", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-2", role: "editor" },
    ] as any);
    vi.mocked(updateWorkspaceMemberRole).mockResolvedValue({ id: "m-1", role: "admin" } as any);

    await updateMemberRoleAction("ws-1", "m-1", "admin");
    expect(updateWorkspaceMemberRole).toHaveBeenCalledWith("ws-1", "m-1", "admin");
  });

  it("prevents updating the owner's role", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("admin");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "owner-1", role: "owner" },
    ] as any);

    await expect(updateMemberRoleAction("ws-1", "m-1", "editor")).rejects.toThrow(
      "owner's role cannot be modified",
    );
  });

  it("prevents admin from updating another admin", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("admin");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-2", role: "admin" },
    ] as any);

    await expect(updateMemberRoleAction("ws-1", "m-1", "editor")).rejects.toThrow(
      "Administrators cannot modify other administrators",
    );
  });

  it("prevents admin from promoting to admin", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("admin");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-2", role: "editor" },
    ] as any);

    await expect(updateMemberRoleAction("ws-1", "m-1", "admin")).rejects.toThrow(
      "Only the workspace owner can promote",
    );
  });

  it("prevents changing your own role", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-1", role: "editor" },
    ] as any);

    await expect(updateMemberRoleAction("ws-1", "m-1", "editor")).rejects.toThrow(
      "cannot modify your own role",
    );
  });

  it("rejects invalid role", async () => {
    await expect(updateMemberRoleAction("ws-1", "m-1", "owner" as any)).rejects.toThrow("Invalid role");
  });
});

describe("leaveWorkspaceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
  });

  it("allows non-owner to leave", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "owner-1" } as any);
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-1", role: "editor" },
    ] as any);
    vi.mocked(removeWorkspaceMember).mockResolvedValue(undefined);

    await leaveWorkspaceAction("ws-1");
    expect(removeWorkspaceMember).toHaveBeenCalledWith("ws-1", "m-1");
  });

  it("prevents owner from leaving", async () => {
    vi.mocked(fetchWorkspaceById).mockResolvedValue({ id: "ws-1", owner_id: "user-1" } as any);

    await expect(leaveWorkspaceAction("ws-1")).rejects.toThrow(
      "Workspace owner cannot leave",
    );
  });
});

describe("bulkRemoveMembersAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
  });

  it("only allows owner to bulk remove", async () => {
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("editor");

    await expect(bulkRemoveMembersAction("ws-1", ["m-1"])).rejects.toThrow(
      "Only the workspace owner can bulk remove",
    );
  });

  it("filters out owner and self from bulk removal", async () => {
    vi.mocked(fetchWorkspaceMemberRole).mockResolvedValue("owner");
    vi.mocked(fetchWorkspaceMembers).mockResolvedValue([
      { id: "m-1", user_id: "user-2", role: "editor" },
      { id: "m-2", user_id: "user-3", role: "owner" },
      { id: "m-3", user_id: "user-1", role: "owner" },
    ] as any);
    vi.mocked(bulkRemoveWorkspaceMembers).mockResolvedValue(undefined);

    await bulkRemoveMembersAction("ws-1", ["m-1", "m-2", "m-3"]);
    // Should only remove m-1 (valid editor), skipping owner (m-2) and self (m-3)
    expect(bulkRemoveWorkspaceMembers).toHaveBeenCalledWith("ws-1", ["m-1"]);
  });
});
