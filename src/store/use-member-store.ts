import { create } from "zustand";
import { type WorkspaceInvite, type WorkspaceRole, type WorkspaceMemberWithProfile } from "@/types/workspace";

interface MemberState {
  members: WorkspaceMemberWithProfile[];
  invites: WorkspaceInvite[];
  isLoading: boolean;
  setMembers: (members: WorkspaceMemberWithProfile[]) => void;
  setInvites: (invites: WorkspaceInvite[]) => void;
  removeMember: (memberId: string) => void;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => void;
  removeInvite: (inviteId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  invites: [],
  isLoading: false,
  setMembers: (members) => set({ members }),
  setInvites: (invites) => set({ invites }),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    })),
  updateMemberRole: (memberId, role) =>
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, role } : m
      ),
    })),
  removeInvite: (inviteId) =>
    set((state) => ({
      invites: state.invites.filter((i) => i.id !== inviteId),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
