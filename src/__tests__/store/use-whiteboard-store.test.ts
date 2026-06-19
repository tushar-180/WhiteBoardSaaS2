import { describe, it, expect, beforeEach } from "vitest";
import { useWhiteboardStore } from "@/store/use-whiteboard-store";

describe("useWhiteboardStore", () => {
  beforeEach(() => {
    useWhiteboardStore.setState({
      saveStatus: "idle",
      lastSavedAt: null,
    });
  });

  it("initializes with default state", () => {
    const state = useWhiteboardStore.getState();
    expect(state.saveStatus).toBe("idle");
    expect(state.lastSavedAt).toBeNull();
  });

  it("setSaveStatus updates the save status", () => {
    useWhiteboardStore.getState().setSaveStatus("saving");
    expect(useWhiteboardStore.getState().saveStatus).toBe("saving");

    useWhiteboardStore.getState().setSaveStatus("saved");
    expect(useWhiteboardStore.getState().saveStatus).toBe("saved");

    useWhiteboardStore.getState().setSaveStatus("error");
    expect(useWhiteboardStore.getState().saveStatus).toBe("error");

    useWhiteboardStore.getState().setSaveStatus("unsaved");
    expect(useWhiteboardStore.getState().saveStatus).toBe("unsaved");

    useWhiteboardStore.getState().setSaveStatus("idle");
    expect(useWhiteboardStore.getState().saveStatus).toBe("idle");
  });

  it("setLastSavedAt updates the last saved date", () => {
    const date = new Date("2025-06-18T12:00:00Z");
    useWhiteboardStore.getState().setLastSavedAt(date);
    expect(useWhiteboardStore.getState().lastSavedAt).toEqual(date);
  });

  it("setLastSavedAt can set to null", () => {
    useWhiteboardStore.getState().setLastSavedAt(new Date());
    useWhiteboardStore.getState().setLastSavedAt(null);
    expect(useWhiteboardStore.getState().lastSavedAt).toBeNull();
  });

  it("reset restores default state", () => {
    useWhiteboardStore.getState().setSaveStatus("saved");
    useWhiteboardStore.getState().setLastSavedAt(new Date());

    useWhiteboardStore.getState().reset();

    const state = useWhiteboardStore.getState();
    expect(state.saveStatus).toBe("idle");
    expect(state.lastSavedAt).toBeNull();
  });
});
