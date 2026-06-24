import { describe, it, expect, vi } from "vitest";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/utils/supabase/server", () => ({ requireActionAuth: vi.fn(), createClient: vi.fn() }));
vi.mock("@/services/board", () => ({ fetchBoardsByWorkspace: vi.fn(), insertBoard: vi.fn(), updateBoard: vi.fn(), deleteBoard: vi.fn(), updateBoardCanvas: vi.fn() }));
vi.mock("@/services/workspace", () => ({ hasWorkspaceAccess: vi.fn() }));
vi.mock("@/lib/posthog-server", () => ({ getPostHogClient: vi.fn(() => ({ capture: vi.fn() })) }));

import { requireActionAuth, createClient } from "@/utils/supabase/server";
import { fetchBoardsByWorkspace, insertBoard, updateBoard, deleteBoard, updateBoardCanvas } from "@/services/board";
import { hasWorkspaceAccess } from "@/services/workspace";
import { getBoardsAction, createBoardAction, updateBoardAction, deleteBoardAction, updateBoardCanvasAction } from "@/actions/board";

function dbMock() {
  return { from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), neq: vi.fn().mockReturnThis(), ilike: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { owner_id: "u1" }, error: null }), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
}

describe("getBoardsAction", () => {
  it("fetches boards when user has access, throws otherwise", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    vi.mocked(fetchBoardsByWorkspace).mockResolvedValue([{ id: "b1" }] as any);
    expect(await getBoardsAction("ws-1")).toEqual([{ id: "b1" }]);
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(false);
    await expect(getBoardsAction("ws-1")).rejects.toThrow("do not have access");
  });
});

describe("createBoardAction", () => {
  it("creates a board and rejects short names", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    vi.mocked(createClient).mockResolvedValue(dbMock() as any);
    vi.mocked(insertBoard).mockResolvedValue({ id: "b1", name: "My Board" } as any);
    expect((await createBoardAction("ws-1", "My Board", null)).id).toBe("b1");
    await expect(createBoardAction("ws-1", "A", null)).rejects.toThrow("at least 2 characters");
  });
});

describe("updateBoardAction", () => {
  it("updates a board", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    vi.mocked(createClient).mockResolvedValue(dbMock() as any);
    vi.mocked(updateBoard).mockResolvedValue({ id: "b1", name: "Updated" } as any);
    expect((await updateBoardAction("ws-1", "b1", "Updated", null)).name).toBe("Updated");
  });
});

describe("deleteBoardAction", () => {
  it("deletes a board", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    vi.mocked(deleteBoard).mockResolvedValue(undefined);
    await deleteBoardAction("ws-1", "b1");
    expect(deleteBoard).toHaveBeenCalledWith("b1");
  });
});

describe("updateBoardCanvasAction", () => {
  it("updates canvas data", async () => {
    vi.mocked(requireActionAuth).mockResolvedValue({ user: { id: "u1" } as any, supabase: {} as any });
    vi.mocked(hasWorkspaceAccess).mockResolvedValue(true);
    vi.mocked(updateBoardCanvas).mockResolvedValue({ id: "b1", canvas_data: { shapes: [] } } as any);
    expect((await updateBoardCanvasAction("ws-1", "b1", { shapes: [] })).canvas_data).toEqual({ shapes: [] });
  });
});
