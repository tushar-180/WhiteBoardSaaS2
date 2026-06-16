"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function KickedOverlay() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-radial from-background/90 via-background to-background z-50 p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Subtle red ambient glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-destructive/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex p-3 rounded-full bg-destructive/10 border border-destructive/20 text-destructive animate-pulse">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="space-y-2 relative z-10">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            You are no longer in this workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Your access has been revoked or your membership has been removed by the workspace administrator.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={ROUTES.WORKSPACES}
            className="inline-flex w-full items-center justify-center h-10 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
          >
            Go to Workspaces
          </Link>
        </div>
      </div>
    </div>
  );
}
