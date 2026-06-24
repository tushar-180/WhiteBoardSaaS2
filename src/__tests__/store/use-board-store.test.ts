import { describe, it, expect, beforeEach } from "vitest";
import { useBoardStore } from "@/store/use-board-store";
import { type Board } from "@/types/workspace";

const createMockBoard = (overrides: Partial<Board> = {}): Board => ({
  id: "board-1", workspace_id: "ws-1", name: "Test Board", description: null,
  created_by: "user-1", created_at: "", updated_at: "", canvas_data: {},
  ...overrides,
});

describe("useBoardStore", () => {
  beforeEach(() => { useBoardStore.setState({ boards: [], activeBoard: null, isLoading: false }); });

  it("initializes with default state", () => {
    expect(useBoardStore.getState().boards).toEqual([]);
  });

  it("addBoard adds to beginning and updateBoard updates", () => {
    useBoardStore.getState().addBoard(createMockBoard({ id: "1", name: "Old" }));
    useBoardStore.getState().updateBoard(createMockBoard({ id: "1", name: "New" }));
    expect(useBoardStore.getState().boards[0].name).toBe("New");
  });

  it("deleteBoard removes a board by id", () => {
    useBoardStore.getState().setBoards([createMockBoard({ id: "1" }), createMockBoard({ id: "2" })]);
    useBoardStore.getState().deleteBoard("1");
    expect(useBoardStore.getState().boards).toHaveLength(1);
  });

  it("setActiveBoard sets and clears the active board", () => {
    useBoardStore.getState().setActiveBoard(createMockBoard());
    expect(useBoardStore.getState().activeBoard).toBeTruthy();
    useBoardStore.getState().setActiveBoard(null);
    expect(useBoardStore.getState().activeBoard).toBeNull();
  });

  it("setLoading updates the loading state", () => {
    useBoardStore.getState().setLoading(true);
    expect(useBoardStore.getState().isLoading).toBe(true);
  });
});
