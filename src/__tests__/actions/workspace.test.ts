import { describe, it, expect, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({ requireActionAuth: vi.fn(), createClient: vi.fn() }));
vi.mock("@/services/workspace", () => ({ insertWorkspace: vi.fn(), deleteWorkspace: vi.fn(), bulkDeleteWorkspaces: vi.fn() }));
vi.mock("@/services/member", () => ({ bulkLeaveWorkspaces: vi.fn() }));
vi.mock("@/lib/posthog-server", () => ({ getPostHogClient: vi.fn(() => ({ capture: vi.fn() })) }));

import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { insertWorkspace, deleteWorkspace, bulkDeleteWorkspaces } from "@/services/workspace";
import { bulkLeaveWorkspaces } from "@/services/member";
import { createWorkspaceAction, deleteWorkspaceAction, bulkDeleteWorkspacesAction, bulkLeaveWorkspacesAction } from "@/actions/workspace";

function db() {
  return { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), ilike: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { plan_type: "free", status: "active" }, error: null }), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
}

describe("createWorkspaceAction", () => {
  it("creates a workspace and rejects short names", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } as any, supabase: {} as any });
    vi.mocked(createClient).mockResolvedValue(db() as any);
    vi.mocked(insertWorkspace).mockResolvedValue({ id: "ws-1", name: "My WS" } as any);
    expect((await createWorkspaceAction("My WS")).id).toBe("ws-1");
    await expect(createWorkspaceAction("A")).rejects.toThrow("at least 2 characters");
  });
});

describe("deleteWorkspaceAction", () => {
  it("deletes a workspace", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(deleteWorkspace).mockResolvedValue(undefined);
    await deleteWorkspaceAction("ws-1");
    expect(deleteWorkspace).toHaveBeenCalledWith("ws-1", "u1");
  });
});

describe("bulkDeleteWorkspacesAction", () => {
  it("deletes multiple workspaces", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(bulkDeleteWorkspaces).mockResolvedValue(undefined);
    await bulkDeleteWorkspacesAction(["ws-1", "ws-2"]);
    expect(bulkDeleteWorkspaces).toHaveBeenCalledWith(["ws-1", "ws-2"], "u1");
  });
});

describe("bulkLeaveWorkspacesAction", () => {
  it("leaves multiple workspaces", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(bulkLeaveWorkspaces).mockResolvedValue(undefined);
    await bulkLeaveWorkspacesAction(["ws-1", "ws-2"]);
    expect(bulkLeaveWorkspaces).toHaveBeenCalledWith(["ws-1", "ws-2"], "u1");
  });
});
