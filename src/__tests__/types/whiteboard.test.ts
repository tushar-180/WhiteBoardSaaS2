import { describe, it, expect } from "vitest";
import type { SaveStatus, CurrentUser } from "@/types/whiteboard";

describe("whiteboard types", () => {
  it("SaveStatus accepts all valid statuses", () => {
    const statuses: SaveStatus[] = ["idle", "unsaved", "saving", "saved", "error"];
    expect(statuses).toHaveLength(5);
  });

  it("CurrentUser can be constructed with required fields", () => {
    const user: CurrentUser = { id: "user-1", name: "John", email: "john@example.com" };
    expect(user.id).toBe("user-1");
  });
});
