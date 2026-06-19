import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, debounce, isValidUUID, formatRelativeTime, formatDate, hasManagePermission } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("merges Tailwind classes correctly (last wins)", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });
});

describe("debounce", () => {
  it("calls the function after the specified delay", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("test");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("test");
    vi.useRealTimers();
  });

  it("cancels previous calls when called again", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("first");
    debouncedFn("second");

    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("second");
    vi.useRealTimers();
  });

  it("does not call the function before the delay", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("test");

    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("handles multiple rapid calls correctly", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("a");
    vi.advanceTimersByTime(30);
    debouncedFn("b");
    vi.advanceTimersByTime(30);
    debouncedFn("c");

    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
    vi.useRealTimers();
  });
});

describe("isValidUUID", () => {
  it("returns true for valid UUIDs", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUUID("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(true);
  });

  it("returns false for invalid UUIDs", () => {
    expect(isValidUUID("")).toBe(false);
    expect(isValidUUID("not-a-uuid")).toBe(false);
    expect(isValidUUID("123")).toBe(false);
    expect(isValidUUID("550e8400-e29b-41d4-a716-44665544000Z")).toBe(false); // invalid hex char
  });

  it("handles uppercase UUIDs", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("handles edge case UUID format", () => {
    // UUID with wrong length
    expect(isValidUUID("550e8400-e29b-41d4-a716-44665544000")).toBe(false);
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-18T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for very recent dates', () => {
    const date = new Date("2025-06-18T11:59:30Z").toISOString(); // 30 seconds ago
    expect(formatRelativeTime(date)).toBe("Just now");
  });

  it('returns "Xm ago" for minutes', () => {
    const date = new Date("2025-06-18T11:55:00Z").toISOString(); // 5 minutes ago
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it('returns "Xh ago" for hours', () => {
    const date = new Date("2025-06-18T09:00:00Z").toISOString(); // 3 hours ago
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it('returns "Xd ago" for days (less than 7)', () => {
    const date = new Date("2025-06-16T12:00:00Z").toISOString(); // 2 days ago
    expect(formatRelativeTime(date)).toBe("2d ago");
  });

  it("returns formatted date for older dates", () => {
    const date = "2025-05-15T12:00:00Z";
    const result = formatRelativeTime(date);
    expect(result).toMatch(/May 15/);
  });

  it('returns "—" for null input', () => {
    expect(formatRelativeTime(null)).toBe("—");
  });

  it('returns "—" for undefined input', () => {
    expect(formatRelativeTime(undefined)).toBe("—");
  });

  it('returns "—" for invalid date string', () => {
    expect(formatRelativeTime("not-a-date")).toBe("—");
  });

  it('returns "Just now" for the current time', () => {
    const date = new Date("2025-06-18T12:00:00Z").toISOString();
    expect(formatRelativeTime(date)).toBe("Just now");
  });
});

describe("formatDate", () => {
  it('returns "—" for null input', () => {
    expect(formatDate(null)).toBe("—");
  });

  it('returns "—" for undefined input', () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats a valid date string", () => {
    const result = formatDate("2025-06-15T12:00:00Z");
    expect(result).toMatch(/Jun 15, 2025/);
  });

  it('returns "—" for invalid date string', () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("hasManagePermission", () => {
  it("returns true for owner role", () => {
    expect(hasManagePermission("owner")).toBe(true);
  });

  it("returns true for admin role", () => {
    expect(hasManagePermission("admin")).toBe(true);
  });

  it("returns false for editor role", () => {
    expect(hasManagePermission("editor")).toBe(false);
  });

  it("returns false for viewer role", () => {
    expect(hasManagePermission("viewer")).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasManagePermission(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasManagePermission(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasManagePermission("")).toBe(false);
  });
});
