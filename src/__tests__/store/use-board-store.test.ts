import { describe, it, expect, beforeEach } from "vitest";
import { useBoardStore } from "@/store/use-board-store";
import { type Board } from "@/types/workspace";

const createMockBoard = (overrides: Partial<Board> = {}): Board => ({
  id: "board-1",
  workspace_id: "ws-1",
  name: "Test Board",
  description: null,
  created_by: "user-1",
  created_at: "2025-06-18T12:00:00Z",
  updated_at: "2025-06-18T12:00:00Z",
  canvas_data: {},
  ...overrides,
});

describe("useBoardStore", () => {
  beforeEach(() => {
    useBoardStore.setState({
      boards: [],
      activeBoard: null,
      isLoading: false,
    });
  });

  it("initializes with default state", () => {
    const state = useBoardStore.getState();
    expect(state.boards).toEqual([]);
    expect(state.activeBoard).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it("setBoards replaces the boards array", () => {
    const boards = [createMockBoard()];
    useBoardStore.getState().setBoards(boards);
    expect(useBoardStore.getState().boards).toEqual(boards);
  });

  it("addBoard adds a board to the beginning of the list", () => {
    const board1 = createMockBoard({ id: "1", name: "Board 1" });
    const board2 = createMockBoard({ id: "2", name: "Board 2" });

    useBoardStore.getState().addBoard(board1);
    useBoardStore.getState().addBoard(board2);

    const state = useBoardStore.getState();
    expect(state.boards).toHaveLength(2);
    expect(state.boards[0].name).toBe("Board 2");
  });

  it("updateBoard updates an existing board", () => {
    const board = createMockBoard({ id: "1", name: "Old Name" });
    useBoardStore.getState().addBoard(board);

    const updatedBoard = createMockBoard({ id: "1", name: "New Name" });
    useBoardStore.getState().updateBoard(updatedBoard);

    expect(useBoardStore.getState().boards[0].name).toBe("New Name");
  });

  it("updateBoard does nothing for non-existent board", () => {
    const board = createMockBoard({ id: "1" });
    useBoardStore.getState().addBoard(board);

    const nonExistentBoard = createMockBoard({ id: "non-existent", name: "Ghost" });
    useBoardStore.getState().updateBoard(nonExistentBoard);

    expect(useBoardStore.getState().boards).toHaveLength(1);
    expect(useBoardStore.getState().boards[0].name).toBe("Test Board");
  });

  it("deleteBoard removes a board by id", () => {
    const b1 = createMockBoard({ id: "1" });
    const b2 = createMockBoard({ id: "2" });
    useBoardStore.getState().setBoards([b1, b2]);

    useBoardStore.getState().deleteBoard("1");

    expect(useBoardStore.getState().boards).toHaveLength(1);
    expect(useBoardStore.getState().boards[0].id).toBe("2");
  });

  it("setActiveBoard sets the active board", () => {
    const board = createMockBoard();
    useBoardStore.getState().setActiveBoard(board);
    expect(useBoardStore.getState().activeBoard).toEqual(board);
  });

  it("setActiveBoard can set to null", () => {
    useBoardStore.getState().setActiveBoard(createMockBoard());
    useBoardStore.getState().setActiveBoard(null);
    expect(useBoardStore.getState().activeBoard).toBeNull();
  });

  it("setLoading updates the loading state", () => {
    useBoardStore.getState().setLoading(true);
    expect(useBoardStore.getState().isLoading).toBe(true);
  });
});
