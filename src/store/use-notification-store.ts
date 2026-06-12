import { create } from "zustand";
import { type WorkspaceInviteWithWorkspace } from "@/types/workspace";

interface NotificationState {
  invites: WorkspaceInviteWithWorkspace[];
  isLoading: boolean;
  setInvites: (invites: WorkspaceInviteWithWorkspace[]) => void;
  addInvite: (invite: WorkspaceInviteWithWorkspace) => void;
  removeInvite: (inviteId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  invites: [],
  isLoading: false,
  setInvites: (invites) => set({ invites }),
  addInvite: (invite) =>
    set((state) => {
      // Avoid duplicates
      if (state.invites.some((i) => i.id === invite.id)) return state;
      return { invites: [invite, ...state.invites] };
    }),
  removeInvite: (inviteId) =>
    set((state) => ({
      invites: state.invites.filter((i) => i.id !== inviteId),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
