import { describe, it, expect, vi } from "vitest";

vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/utils", () => ({ isValidUUID: vi.fn() }));

import { createClient } from "@/utils/supabase/server";
import { isValidUUID } from "@/lib/utils";
import { fetchBoardsByWorkspace, fetchBoardById, insertBoard, updateBoard, deleteBoard, updateBoardCanvas } from "@/services/board";

function b() {
  const x: any = { from: vi.fn(), select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), order: vi.fn(), single: vi.fn() };
  x.from.mockReturnValue(x); x.select.mockReturnValue(x); x.insert.mockReturnValue(x); x.update.mockReturnValue(x); x.delete.mockReturnValue(x); x.eq.mockReturnValue(x); x.order.mockReturnValue(x);
  x.single.mockResolvedValue({ data: null, error: null }); return x;
}

describe("fetchBoardsByWorkspace", () => {
  it("returns boards ordered by created_at desc", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    const boards = [{ id: "1", workspace_id: "ws-1", name: "B1" }];
    x.order.mockResolvedValue({ data: boards, error: null });
    expect(await fetchBoardsByWorkspace("ws-1")).toEqual(boards);
  });
  it("throws on error", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.order.mockResolvedValue({ data: null, error: { message: "DB error" } });
    await expect(fetchBoardsByWorkspace("ws-1")).rejects.toThrow("DB error");
  });
});

describe("fetchBoardById", () => {
  it("returns null for invalid UUID", async () => {
    vi.mocked(isValidUUID).mockReturnValue(false);
    expect(await fetchBoardById("bad")).toBeNull();
  });
  it("returns board on success", async () => {
    vi.mocked(isValidUUID).mockReturnValue(true);
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "1" }, error: null });
    expect(await fetchBoardById("uuid")).toEqual({ id: "1" });
  });
});

describe("insertBoard", () => {
  it("creates a board with empty canvas", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "1", name: "B" }, error: null });
    expect(await insertBoard("ws-1", "B", null, "u1")).toEqual({ id: "1", name: "B" });
  });
});

describe("updateBoard", () => {
  it("updates board name", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "1", name: "Updated" }, error: null });
    await updateBoard("1", "Updated", null);
    expect(x.update).toHaveBeenCalledWith(expect.objectContaining({ name: "Updated" }));
  });
});

describe("deleteBoard", () => {
  it("deletes a board", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.eq.mockReturnValueOnce(x).mockReturnValueOnce({ then: (r: Function) => r({ error: null }) });
    await deleteBoard("1");
    expect(x.delete).toHaveBeenCalled();
  });
});

describe("updateBoardCanvas", () => {
  it("updates canvas data", async () => {
    const x = b(); vi.mocked(createClient).mockResolvedValue(x);
    x.single.mockResolvedValue({ data: { id: "1", canvas_data: { shapes: [] } }, error: null });
    expect((await updateBoardCanvas("1", { shapes: [] })).canvas_data).toEqual({ shapes: [] });
  });
});
