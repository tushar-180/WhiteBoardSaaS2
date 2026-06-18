import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";


const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://zentrox-one.vercel.app"
  ),
  title: {
    default: "Zentrox | The Collaborative Whiteboard for Teams",
    template: "%s | Zentrox",
  },
  description:
    "Zentrox is a high-performance, real-time collaborative whiteboard. Sketch, plan, and collaborate with your team instantly. Workspace-based, secure, and fast.",
  keywords: [
    "whiteboard",
    "collaboration",
    "team workspace",
    "drawing",
    "real-time",
    "saas",
    "zentrox",
  ],
  authors: [{ name: "Zentrox Team" }],
  creator: "Zentrox",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zentrox-one.vercel.app",
    title: "Zentrox | The Collaborative Whiteboard for Teams",
    description:
      "A high-performance, real-time collaborative whiteboard. Sketch, plan, and collaborate with your team instantly.",
    siteName: "Zentrox",
    images: [
      {
        url: "/whiteboard_banner.png",
        width: 1200,
        height: 630,
        alt: "Zentrox Whiteboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zentrox | Collaborative Whiteboard",
    description:
      "A high-performance, real-time collaborative whiteboard for modern teams.",
    images: ["/whiteboard_banner.png"],
    creator: "@zentrox",
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
      className={cn("h-full dark antialiased", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
