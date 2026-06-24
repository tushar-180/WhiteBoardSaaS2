import type { NextConfig } from "next";

const allowedOrigins: string[] = [
  "*.github.dev",
  "*.preview.app.github.dev",
  "*.ngrok-free.app",
  "*.devtunnels.ms",
  "localhost:3000",
];

// Add app domain
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (baseUrl) {
  const host = baseUrl
    .replace(/^https?:\/\//, "")
    .split("/")[0];

  if (host) {
    allowedOrigins.push(host);
  }
}

// Add sync server domain
const syncUrl = process.env.NEXT_PUBLIC_SYNC_SERVER_URL;
if (syncUrl) {
  const host = syncUrl
    .replace(/^(wss?|https?):\/\//, "")
    .split("/")[0];

  if (host) {
    allowedOrigins.push(host);
  }
}

// Remove duplicates
const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

// Supabase hostname
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "**.supabase.co";

const nextConfig: NextConfig = {
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? ["192.168.0.135"]
      : undefined,

  transpilePackages: [
    "tldraw",
    "@tldraw/editor",
    "@tldraw/state",
    "@tldraw/state-react",
    "@tldraw/store",
    "@tldraw/tlschema",
    "@tldraw/utils",
    "@tldraw/validate"
  ],

  experimental: {
    serverActions: {
      allowedOrigins: uniqueAllowedOrigins,
    },
  },

  images: {
    minimumCacheTTL: 60 * 60 * 24, // 1 day

    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)\\.(ico|png|jpg|jpeg|svg|webp|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/ingest/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/ingest/array/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  skipTrailingSlashRedirect: true,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn", "info"],
          }
        : false,
  },
};

export default nextConfig;