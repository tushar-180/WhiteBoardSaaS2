import { describe, it, expect, beforeEach } from "vitest";
import { useMemberStore } from "@/store/use-member-store";

describe("useMemberStore", () => {
  beforeEach(() => { useMemberStore.setState({ members: [], invites: [], isLoading: false }); });

  it("initializes with empty state", () => {
    expect(useMemberStore.getState().members).toEqual([]);
    expect(useMemberStore.getState().invites).toEqual([]);
  });

  it("setMembers and removeMember work", () => {
    const m1 = { id: "1", workspace_id: "ws-1", user_id: "u1", joined_at: "", role: "editor" as const, email: "a@b.com", name: "A", avatar_url: null };
    const m2 = { ...m1, id: "2" };
    useMemberStore.getState().setMembers([m1, m2]);
    useMemberStore.getState().removeMember("1");
    expect(useMemberStore.getState().members).toHaveLength(1);
  });

  it("updateMemberRole updates a member's role", () => {
    useMemberStore.getState().setMembers([{ id: "1", workspace_id: "ws-1", user_id: "u1", joined_at: "", role: "editor", email: "a@b.com", name: "A", avatar_url: null }]);
    useMemberStore.getState().updateMemberRole("1", "admin");
    expect(useMemberStore.getState().members[0].role).toBe("admin");
  });

  it("setInvites and removeInvite work", () => {
    useMemberStore.getState().setInvites([{ id: "1", workspace_id: "ws-1", email: "a@b.com", token: "t", status: "pending", created_by: "u1", accepted_by: null, role: "editor", created_at: "" }]);
    useMemberStore.getState().removeInvite("1");
    expect(useMemberStore.getState().invites).toHaveLength(0);
  });
});
