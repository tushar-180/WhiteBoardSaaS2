import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Zentrox — Collaborative Whiteboard",
    template: "%s | Zentrox",
  },
  description:
    "Zentrox is a high-performance collaborative whiteboard application. Create workspaces, invite your team, and sketch ideas together in real time.",
  keywords: [
    "whiteboard",
    "collaborative workspace",
    "team canvas",
    "real-time drawing",
    "Zentrox",
  ],
  authors: [{ name: "Zentrox" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Zentrox — Collaborative Whiteboard",
    description:
      "Create workspaces, invite your team, and sketch ideas together on an infinite canvas.",
    siteName: "Zentrox",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentrox — Collaborative Whiteboard",
    description:
      "Create workspaces, invite your team, and sketch ideas together on an infinite canvas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full dark", "antialiased", inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
