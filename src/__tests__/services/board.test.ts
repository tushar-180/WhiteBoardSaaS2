import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  isValidUUID: vi.fn(),
}));

import { createClient } from "@/utils/supabase/server";
import { isValidUUID } from "@/lib/utils";
import {
  fetchBoardsByWorkspace,
  fetchBoardById,
  insertBoard,
  updateBoard,
  deleteBoard,
  updateBoardCanvas,
} from "@/services/board";

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
    order: vi.fn(),
    single: vi.fn(),
  };
  b.from.mockReturnValue(b);
  b.select.mockReturnValue(b);
  b.insert.mockReturnValue(b);
  b.update.mockReturnValue(b);
  b.delete.mockReturnValue(b);
  b.eq.mockReturnValue(b);
  b.order.mockReturnValue(b);
  b.single.mockResolvedValue({ data: null, error: null });
  return b;
}

describe("fetchBoardsByWorkspace", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns boards ordered by created_at desc", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    const boards = [{ id: "1", workspace_id: "ws-1", name: "Board 1", canvas_data: {} }];
    b.order.mockResolvedValue({ data: boards, error: null });

    const result = await fetchBoardsByWorkspace("ws-1");
    expect(result).toEqual(boards);
    expect(b.from).toHaveBeenCalledWith("boards");
    expect(b.eq).toHaveBeenCalledWith("workspace_id", "ws-1");
    expect(b.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("returns empty array when no boards", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.order.mockResolvedValue({ data: null, error: null });

    expect(await fetchBoardsByWorkspace("ws-1")).toEqual([]);
  });

  it("throws on error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.order.mockResolvedValue({ data: null, error: { message: "DB error" } });

    await expect(fetchBoardsByWorkspace("ws-1")).rejects.toThrow("DB error");
  });
});

describe("fetchBoardById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isValidUUID).mockReturnValue(true);
  });

  it("returns null for invalid UUID", async () => {
    vi.mocked(isValidUUID).mockReturnValue(false);
    expect(await fetchBoardById("invalid")).toBeNull();
  });

  it("returns board on success", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "board-1", name: "Board" }, error: null });

    expect(await fetchBoardById("uuid")).toEqual({ id: "board-1", name: "Board" });
  });

  it("returns null on error", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: null, error: { message: "fail" } });

    expect(await fetchBoardById("uuid")).toBeNull();
  });
});

describe("insertBoard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a board with empty canvas", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    const board = { id: "board-1", name: "Board", description: null, canvas_data: {} };
    b.single.mockResolvedValue({ data: board, error: null });

    expect(await insertBoard("ws-1", "Board", null, "user-1")).toEqual(board);
    expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({
      workspace_id: "ws-1", name: "Board", canvas_data: {},
    }));
  });

  it("creates a board with description", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "board-1" }, error: null });

    await insertBoard("ws-1", "Board", "A description", "user-1");
    expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({ description: "A description" }));
  });
});

describe("updateBoard", () => {
  it("updates board name and description", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.single.mockResolvedValue({ data: { id: "board-1", name: "Updated" }, error: null });

    await updateBoard("board-1", "Updated", null);
    expect(b.update).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated" }));
    expect(b.eq).toHaveBeenCalledWith("id", "board-1");
  });
});

describe("deleteBoard", () => {
  it("deletes a board", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    b.eq.mockReturnValueOnce(terminal());

    await deleteBoard("board-1");
    expect(b.from).toHaveBeenCalledWith("boards");
    expect(b.delete).toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith("id", "board-1");
  });
});

describe("updateBoardCanvas", () => {
  it("updates canvas data", async () => {
    const b = buildClient();
    vi.mocked(createClient).mockResolvedValue(b);
    const canvas = { shapes: [] };
    b.single.mockResolvedValue({ data: { id: "board-1", canvas_data: canvas }, error: null });

    const result = await updateBoardCanvas("board-1", canvas);
    expect(result.canvas_data).toEqual(canvas);
  });
});
