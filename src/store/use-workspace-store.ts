import { create } from "zustand";
import { type Workspace } from "@/types/workspace";
import { type UserProfile } from "@/types/profile";

export type { UserProfile };

interface WorkspaceState {
  workspaces: Workspace[];
  user: UserProfile | null;
  isLoading: boolean;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  deleteWorkspace: (id: string) => void;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  user: null,
  isLoading: false,
  setWorkspaces: (workspaces) => set({ workspaces }),
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [workspace, ...state.workspaces] })),
  deleteWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
    })),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

