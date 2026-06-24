import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "@/store/use-notification-store";

describe("useNotificationStore", () => {
  beforeEach(() => { useNotificationStore.setState({ invites: [], isLoading: false }); });

  it("initializes with empty invites", () => {
    expect(useNotificationStore.getState().invites).toEqual([]);
  });

  it("setInvites replaces the invites array", () => {
    const invites = [{ id: "1", workspace_id: "ws-1", email: "a@b.com", token: "t", status: "pending", created_by: "u1", accepted_by: null, role: "editor", workspace_name: "Test", created_at: "" }];
    useNotificationStore.getState().setInvites(invites);
    expect(useNotificationStore.getState().invites).toEqual(invites);
  });

  it("addInvite adds to beginning and deduplicates", () => {
    const invite = { id: "1", workspace_id: "ws-1", email: "a@b.com", token: "t", status: "pending", created_by: "u1", accepted_by: null, role: "editor", workspace_name: "Test", created_at: "" };
    useNotificationStore.getState().addInvite(invite);
    useNotificationStore.getState().addInvite(invite);
    expect(useNotificationStore.getState().invites).toHaveLength(1);
  });

  it("removeInvite removes by id", () => {
    useNotificationStore.getState().setInvites([
      { id: "1", workspace_id: "ws-1", email: "a@b.com", token: "t", status: "pending", created_by: "u1", accepted_by: null, role: "editor", workspace_name: "Test", created_at: "" },
    ]);
    useNotificationStore.getState().removeInvite("1");
    expect(useNotificationStore.getState().invites).toHaveLength(0);
  });
});
