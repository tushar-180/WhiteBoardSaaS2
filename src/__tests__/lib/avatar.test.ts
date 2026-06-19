import { describe, it, expect } from "vitest";
import { getOptimizedAvatarUrl } from "@/lib/avatar";

describe("getOptimizedAvatarUrl", () => {
  it("returns undefined for null input", () => {
    expect(getOptimizedAvatarUrl(null)).toBeUndefined();
  });

  it("returns undefined for undefined input", () => {
    expect(getOptimizedAvatarUrl(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(getOptimizedAvatarUrl("")).toBeUndefined();
  });

  it("adds size param for GitHub avatar URLs", () => {
    const url = "https://avatars.githubusercontent.com/u/12345?v=4";
    const result = getOptimizedAvatarUrl(url, 64);
    expect(result).toContain("s=64");
    expect(result).toContain("avatars.githubusercontent.com");
  });

  it("defaults size to 48", () => {
    const url = "https://avatars.githubusercontent.com/u/12345";
    const result = getOptimizedAvatarUrl(url);
    expect(result).toContain("s=48");
  });

  it("adds Supabase image transformation params", () => {
    const url =
      "https://project.supabase.co/storage/v1/object/public/avatars/user123/avatar.jpg";
    const result = getOptimizedAvatarUrl(url, 80);
    expect(result).toContain("width=80");
    expect(result).toContain("height=80");
    expect(result).toContain("resize=cover");
    expect(result).toContain("quality=80");
  });

  it("returns the URL unchanged for non-GitHub, non-Supabase URLs", () => {
    const url = "https://example.com/avatar.png";
    const result = getOptimizedAvatarUrl(url);
    expect(result).toBe(url);
  });

  it("preserves existing query parameters when adding GitHub size", () => {
    const url = "https://avatars.githubusercontent.com/u/12345?v=4";
    const result = getOptimizedAvatarUrl(url, 100);
    expect(result).toContain("v=4");
    expect(result).toContain("s=100");
  });

  it("preserves existing query parameters when adding Supabase params", () => {
    const url =
      "https://project.supabase.co/storage/v1/object/public/avatars/user123/avatar.jpg?token=abc";
    const result = getOptimizedAvatarUrl(url, 48);
    expect(result).toContain("token=abc");
    expect(result).toContain("width=48");
  });

  it("returns the raw URL if it is not parseable", () => {
    // Invalid URLs that slip through
    const url = "data:image/png;base64,abc";
    const result = getOptimizedAvatarUrl(url);
    expect(result).toBe(url);
  });
});
