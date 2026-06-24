import { describe, it, expect, beforeEach } from "vitest";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";

describe("useWhiteboardStore", () => {
  beforeEach(() => { useWhiteboardStore.setState({ saveStatus: "idle", lastSavedAt: null }); });

  it("initializes with default state", () => {
    expect(useWhiteboardStore.getState().saveStatus).toBe("idle");
  });

  it("setSaveStatus updates the save status", () => {
    useWhiteboardStore.getState().setSaveStatus("saving");
    expect(useWhiteboardStore.getState().saveStatus).toBe("saving");
  });

  it("reset restores default state", () => {
    useWhiteboardStore.getState().setSaveStatus("saved");
    useWhiteboardStore.getState().reset();
    expect(useWhiteboardStore.getState().saveStatus).toBe("idle");
  });
});
