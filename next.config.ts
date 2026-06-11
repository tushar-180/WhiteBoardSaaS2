import type { NextConfig } from "next";

const allowedOrigins: string[] = [
  "*.github.dev",
  "*.preview.app.github.dev",
  "*.ngrok-free.app",
  "*.devtunnels.ms",
  "localhost:3000",
];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (baseUrl) {
  // Strip protocol and trailing paths if present
  let host = baseUrl.replace(/^https?:\/\//, "");
  host = host.split("/")[0];
  if (host) {
    allowedOrigins.push(host);
  }
}

const syncUrl = process.env.NEXT_PUBLIC_SYNC_SERVER_URL;
if (syncUrl) {
  // Strip ws/wss/http/https protocol and trailing paths
  let host = syncUrl.replace(/^(wss?|https?):\/\//, "");
  host = host.split("/")[0];
  if (host) {
    allowedOrigins.push(host);
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.135"],
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
