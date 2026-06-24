import { describe, it, expect } from "vitest";
import { getOptimizedAvatarUrl } from "@/lib/avatar";

describe("getOptimizedAvatarUrl", () => {
  it("returns undefined for null/undefined/empty input", () => {
    expect(getOptimizedAvatarUrl(null)).toBeUndefined();
    expect(getOptimizedAvatarUrl("")).toBeUndefined();
  });

  it("adds size param for GitHub avatar URLs", () => {
    const result = getOptimizedAvatarUrl("https://avatars.githubusercontent.com/u/12345?v=4", 64);
    expect(result).toContain("s=64");
  });

  it("adds Supabase image transformation params", () => {
    const result = getOptimizedAvatarUrl(
      "https://project.supabase.co/storage/v1/object/public/avatars/user123/avatar.jpg", 80,
    );
    expect(result).toContain("width=80");
    expect(result).toContain("resize=cover");
  });

  it("returns non-GitHub/Supabase URLs unchanged", () => {
    const url = "https://example.com/avatar.png";
    expect(getOptimizedAvatarUrl(url)).toBe(url);
  });
});
