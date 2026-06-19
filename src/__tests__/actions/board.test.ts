import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/utils/supabase/server", () => ({
  requireActionAuth: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("@/services/board", () => ({
  fetchBoardsByWorkspace: vi.fn(),
  insertBoard: vi.fn(),
  updateBoard: vi.fn(),
  deleteBoard: vi.fn(),
  updateBoardCanvas: vi.fn(),
}));

vi.mock("@/services/workspace", () => ({
  hasWorkspaceAccess: vi.fn(),
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: vi.fn(() => ({
    capture: vi.fn(),
  })),
}));

import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { fetchBoardsByWorkspace, insertBoard, updateBoard, deleteBoard, updateBoardCanvas } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { getBoardsAction, createBoardAction, updateBoardAction, deleteBoardAction, updateBoardCanvasAction } from "@/actions/board";

describe("getBoardsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
  });

  it("fetches boards when user has access", async () => {
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    const mockBoards = [{ id: "board-1", name: "Board" }];
    vi.mocked(fetchBoardsByWorkspace).mockResolvedValue(mockBoards as any);

    const result = await getBoardsAction("ws-1");
    expect(result).toEqual(mockBoards);
  });

  it("throws when user lacks access", async () => {
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(false);

    await expect(getBoardsAction("ws-1")).rejects.toThrow("do not have access");
  });
});

describe("createBoardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
  });

  it("creates a board", async () => {
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(db as any);

    const mockBoard = { id: "board-1", workspace_id: "ws-1", name: "My Board", description: null, created_by: "user-1" };
    vi.mocked(insertBoard).mockResolvedValue(mockBoard as any);

    const result = await createBoardAction("ws-1", "My Board", null);
    expect(result).toEqual(mockBoard);
  });

  it("rejects short board names", async () => {
    await expect(createBoardAction("ws-1", "A", null)).rejects.toThrow("at least 2 characters");
  });

  it("rejects duplicate board names", async () => {
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "existing" }, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(db as any);

    await expect(createBoardAction("ws-1", "My Board", null)).rejects.toThrow("already taken");
  });
});

describe("updateBoardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
  });

  it("updates a board", async () => {
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(db as any);

    const mockBoard = { id: "board-1", name: "Updated", description: "New desc" };
    vi.mocked(updateBoard).mockResolvedValue(mockBoard as any);

    const result = await updateBoardAction("ws-1", "board-1", "Updated", "New desc");
    expect(result).toEqual(mockBoard);
  });

  it("rejects duplicate names (excluding current)", async () => {
    const db = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: "other-board" }, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(db as any);

    await expect(updateBoardAction("ws-1", "board-1", "My Board", null)).rejects.toThrow("already taken");
  });
});

describe("deleteBoardAction", () => {
  it("deletes a board when user has access", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    vi.mocked(deleteBoard).mockResolvedValue(undefined);

    await deleteBoardAction("ws-1", "board-1");
    expect(deleteBoard).toHaveBeenCalledWith("board-1");
  });
});

describe("updateBoardCanvasAction", () => {
  it("updates canvas data", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({
      user: { id: "user-1" } as any,
      supabase: {} as any,
    });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    const canvasData = { shapes: [] };
    vi.mocked(updateBoardCanvas).mockResolvedValue({ id: "board-1", canvas_data: canvasData } as any);

    const result = await updateBoardCanvasAction("ws-1", "board-1", canvasData);
    expect(result.canvas_data).toEqual(canvasData);
  });
});
