import { describe, it, expect, beforeEach } from "vitest";
import { useMemberStore } from "@/store/use-member-store";
import { type WorkspaceMemberWithProfile, type WorkspaceInvite } from "@/types/workspace";

const createMockMember = (overrides: Partial<WorkspaceMemberWithProfile> = {}): WorkspaceMemberWithProfile => ({
  id: "member-1",
  workspace_id: "ws-1",
  user_id: "user-1",
  joined_at: "2025-06-18T12:00:00Z",
  role: "editor",
  email: "test@example.com",
  name: "Test User",
  avatar_url: null,
  ...overrides,
});

const createMockInvite = (overrides: Partial<WorkspaceInvite> = {}): WorkspaceInvite => ({
  id: "invite-1",
  workspace_id: "ws-1",
  email: "test@example.com",
  token: "token-123",
  status: "pending",
  created_by: "user-1",
  accepted_by: null,
  role: "editor",
  created_at: "2025-06-18T12:00:00Z",
  ...overrides,
});

describe("useMemberStore", () => {
  beforeEach(() => {
    useMemberStore.setState({
      members: [],
      invites: [],
      isLoading: false,
    });
  });

  describe("members", () => {
    it("initializes with empty members", () => {
      expect(useMemberStore.getState().members).toEqual([]);
    });

    it("setMembers replaces the members array", () => {
      const members = [createMockMember()];
      useMemberStore.getState().setMembers(members);
      expect(useMemberStore.getState().members).toEqual(members);
    });

    it("removeMember removes a member by id", () => {
      const m1 = createMockMember({ id: "1" });
      const m2 = createMockMember({ id: "2" });
      useMemberStore.getState().setMembers([m1, m2]);

      useMemberStore.getState().removeMember("1");

      const state = useMemberStore.getState();
      expect(state.members).toHaveLength(1);
      expect(state.members[0].id).toBe("2");
    });

    it("updateMemberRole updates a member's role", () => {
      const member = createMockMember({ id: "1", role: "editor" });
      useMemberStore.getState().setMembers([member]);

      useMemberStore.getState().updateMemberRole("1", "admin");

      expect(useMemberStore.getState().members[0].role).toBe("admin");
    });

    it("updateMemberRole does nothing for non-existent member", () => {
      const member = createMockMember({ id: "1", role: "editor" });
      useMemberStore.getState().setMembers([member]);

      useMemberStore.getState().updateMemberRole("non-existent", "admin");

      expect(useMemberStore.getState().members[0].role).toBe("editor");
    });
  });

  describe("invites", () => {
    it("initializes with empty invites", () => {
      expect(useMemberStore.getState().invites).toEqual([]);
    });

    it("setInvites replaces the invites array", () => {
      const invites = [createMockInvite()];
      useMemberStore.getState().setInvites(invites);
      expect(useMemberStore.getState().invites).toEqual(invites);
    });

    it("removeInvite removes an invite by id", () => {
      const i1 = createMockInvite({ id: "1" });
      const i2 = createMockInvite({ id: "2" });
      useMemberStore.getState().setInvites([i1, i2]);

      useMemberStore.getState().removeInvite("1");

      expect(useMemberStore.getState().invites).toHaveLength(1);
      expect(useMemberStore.getState().invites[0].id).toBe("2");
    });
  });

  it("setLoading updates the loading state", () => {
    useMemberStore.getState().setLoading(true);
    expect(useMemberStore.getState().isLoading).toBe(true);

    useMemberStore.getState().setLoading(false);
    expect(useMemberStore.getState().isLoading).toBe(false);
  });
});
