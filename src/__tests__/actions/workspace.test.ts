import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Next.js modules
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  requireActionAuth: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("@/services/workspace", () => ({
  insertWorkspace: vi.fn(),
  deleteWorkspace: vi.fn(),
  bulkDeleteWorkspaces: vi.fn(),
}));

vi.mock("@/services/member", () => ({
  bulkLeaveWorkspaces: vi.fn(),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn(() => ({
    capture: vi.fn(),
  })),
}));

import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { insertWorkspace, deleteWorkspace, bulkDeleteWorkspaces } from "@/services/workspace";
import { bulkLeaveWorkspaces } from "@/services/member";
import {
  createWorkspaceAction,
  deleteWorkspaceAction,
  bulkDeleteWorkspacesAction,
  bulkLeaveWorkspacesAction,
} from "@/actions/workspace";

describe("createWorkspaceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" } as any,
      supabase: {} as any,
    });
  });

  it("creates a workspace successfully", async () => {
    const mockWorkspace = { id: "ws-1", name: "My Workspace", slug: "my-workspace-abc1", owner_id: "user-1", created_at: "", updated_at: "" };
    vi.mocked(insertWorkspace).mockResolvedValue(mockWorkspace);

    // Mock the duplicate check
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(db as any);

    const result = await createWorkspaceAction("My Workspace");
    expect(result).toEqual(mockWorkspace);
    expect(insertWorkspace).toHaveBeenCalledWith("My Workspace", expect.any(String), "user-1");
  });

  it("rejects workspace name that is too short", async () => {
    await expect(createWorkspaceAction("A")).rejects.toThrow("at least 2 characters");
  });

  it("rejects duplicated workspace names for the same owner", async () => {
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "existing" }, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(db as any);

    await expect(createWorkspaceAction("My Workspace")).rejects.toThrow(
      'already created a workspace named "My Workspace"',
    );
  });

  it("requires authentication", async () => {
    vi.mocked(requireActionAuth).mockRejectedValue(new Error("You must be logged in"));

    await expect(createWorkspaceAction("Test")).rejects.toThrow("You must be logged in");
  });
});

describe("deleteWorkspaceAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com" } as any,
      supabase: {} as any,
    });
  });

  it("deletes a workspace", async () => {
    vi.mocked(deleteWorkspace).mockResolvedValue(undefined);

    await deleteWorkspaceAction("ws-1");
    expect(deleteWorkspace).toHaveBeenCalledWith("ws-1", "user-1");
  });

  it("requires authentication", async () => {
    vi.mocked(requireActionAuth).mockRejectedValue(new Error("You must be logged in"));

    await expect(deleteWorkspaceAction("ws-1")).rejects.toThrow("You must be logged in");
  });
});

describe("bulkDeleteWorkspacesAction", () => {
  it("deletes multiple workspaces", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(bulkDeleteWorkspaces).mockResolvedValue(undefined);

    await bulkDeleteWorkspacesAction(["ws-1", "ws-2"]);
    expect(bulkDeleteWorkspaces).toHaveBeenCalledWith(["ws-1", "ws-2"], "user-1");
  });
});

describe("bulkLeaveWorkspacesAction", () => {
  it("leaves multiple workspaces", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(bulkLeaveWorkspaces).mockResolvedValue(undefined);

    await bulkLeaveWorkspacesAction(["ws-1", "ws-2"]);
    expect(bulkLeaveWorkspaces).toHaveBeenCalledWith(["ws-1", "ws-2"], "user-1");
  });
});
