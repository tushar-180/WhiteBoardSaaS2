import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zentrox-one.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/board/",
        "/dashboard/",
        "/invite/",
        "/workspaces/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
