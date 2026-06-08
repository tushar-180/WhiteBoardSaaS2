import { create } from "zustand";
import { type Board } from "@/types/workspace";

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  isLoading: boolean;
  setBoards: (boards: Board[]) => void;
  addBoard: (board: Board) => void;
  updateBoard: (board: Board) => void;
  deleteBoard: (id: string) => void;
  setActiveBoard: (board: Board | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  boards: [],
  activeBoard: null,
  isLoading: false,
  setBoards: (boards) => set({ boards }),
  addBoard: (board) =>
    set((state) => ({ boards: [board, ...state.boards] })),
  updateBoard: (updatedBoard) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === updatedBoard.id ? updatedBoard : b
      ),
    })),
  deleteBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
    })),
  setActiveBoard: (activeBoard) => set({ activeBoard }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
