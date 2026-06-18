/**
 * Returns an optimized avatar URL with image transformation params
 * to drastically reduce download size for avatar thumbnails.
 *
 * Supabase: adds ?width&height&resize=cover&format=webp&quality=80
 *   Without these, Supabase serves the original uploaded file (often >200 KiB).
 *   With transformation, we get a properly sized WebP thumbnail (~3-8 KiB).
 * GitHub: adds ?s=size to request a smaller pre-rendered image.
 */
export function getOptimizedAvatarUrl(
  url: string | null | undefined,
  size = 48,
): string | undefined {
  if (!url) return undefined;

  try {
    const u = new URL(url);

    if (u.hostname === "avatars.githubusercontent.com") {
      u.searchParams.set("s", String(size));
      return u.toString();
    }

    if (u.pathname.includes("/storage/v1/")) {
      u.searchParams.set("width", String(size));
      u.searchParams.set("height", String(size));
      u.searchParams.set("resize", "cover");
      u.searchParams.set("quality", "80");
      return u.toString();
    }

    return u.toString();
  } catch {
    return url;
  }
}