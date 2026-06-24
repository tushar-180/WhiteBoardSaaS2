import { describe, it, expect, vi } from "vitest";
import { cn, debounce, isValidUUID, formatRelativeTime, formatDate, hasManagePermission } from "@/lib/utils";

describe("cn", () => {
  it("merges class names with Tailwind last-wins", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });
});

describe("debounce", () => {
  it("calls the function after the specified delay", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);
    debouncedFn("test");
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("test");
    vi.useRealTimers();
  });
});

describe("isValidUUID", () => {
  it("validates UUID format correctly", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUUID("not-a-uuid")).toBe(false);
  });
});

describe("formatRelativeTime", () => {
  it("returns relative time strings", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-18T12:00:00Z"));
    expect(formatRelativeTime(new Date("2025-06-18T11:59:30Z").toISOString())).toBe("Just now");
    expect(formatRelativeTime(new Date("2025-06-18T11:55:00Z").toISOString())).toBe("5m ago");
    vi.useRealTimers();
  });
});

describe("formatDate", () => {
  it("formats a valid date string", () => {
    expect(formatDate("2025-06-15T12:00:00Z")).toMatch(/Jun 15, 2025/);
  });
});

describe("hasManagePermission", () => {
  it("returns true for owner/admin, false otherwise", () => {
    expect(hasManagePermission("owner")).toBe(true);
    expect(hasManagePermission("admin")).toBe(true);
    expect(hasManagePermission("editor")).toBe(false);
    expect(hasManagePermission(null)).toBe(false);
  });
});
