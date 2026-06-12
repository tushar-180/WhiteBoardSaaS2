"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";
import { ROUTES, ASSETS } from "@/lib/constants";
import { NotificationInbox } from "./notification-inbox";

interface WorkspaceNavProps {
  userEmail?: string;
  userId?: string;
  logoHref?: string;
}

export function WorkspaceNav({ userEmail, userId, logoHref = ROUTES.HOME }: WorkspaceNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={logoHref}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Image
            src={ASSETS.LOGO}
            alt="Zentrox Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="font-black tracking-tight text-lg text-foreground">
            Zentrox
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {userEmail && (
            <>
              <NotificationInbox userEmail={userEmail} userId={userId} />
              <span className="text-xs text-muted-foreground hidden sm:inline-block font-medium">
                {userEmail}
              </span>
            </>
          )}
          <form action={signOutAction}>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="rounded-xl text-muted-foreground hover:text-foreground gap-1.5 h-9 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
