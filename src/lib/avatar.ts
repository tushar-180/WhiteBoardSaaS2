/**
 * Returns an optimized avatar URL with image transformation params
 * to drastically reduce download size for avatar thumbnails.
 *
 * Supabase: adds ?width&height&resize=cover&format=webp&quality=80
 *   Without these, Supabase serves the original uploaded file (often >200 KiB).
 *   With transformation, we get a properly sized WebP thumbnail (~3-8 KiB).
 * GitHub: adds ?s=size to request a smaller pre-rendered image.
 */
// export function getOptimizedAvatarUrl(
//   url: string | null | undefined,
//   size: number = 48,
// ): string | undefined {
//   if (!url) return undefined;

//   // GitHub avatars: append s=size to existing params (preserves cache-busting v=4 param)
//   if (url.includes("avatars.githubusercontent.com")) {
//     const separator = url.includes("?") ? "&" : "?";
//     return `${url}${separator}s=${size}`;
//   }

//   // Supabase storage: use image transformation params
//   if (url.includes("supabase.co/storage")) {
//     const base = url.split("?")[0];
//     return `${base}?width=${size}&height=${size}&resize=cover&format=webp&quality=80`;
//   }

//   return url;
// }
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