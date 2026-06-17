"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings-store";
import { signOutAction } from "@/actions/auth";
import { ROUTES, ASSETS } from "@/lib/constants";
import { NotificationInbox } from "./notification-inbox";

interface WorkspaceNavProps {
  userEmail?: string;
  userId?: string;
  logoHref?: string;
}

export function WorkspaceNav({ userEmail, userId, logoHref = ROUTES.HOME }: WorkspaceNavProps) {
  const { setIsOpen } = useSettingsStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href={logoHref}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Image
            src={ASSETS.LOGO}
            alt="Zentrox Logo"
            width={32}
            height={32}
            className="object-contain w-auto h-auto"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="font-black tracking-tight text-lg text-foreground hidden sm:inline">
            Zentrox
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {userEmail && (
            <>
              <NotificationInbox userEmail={userEmail} userId={userId} />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="rounded-full text-muted-foreground hover:text-foreground h-9 w-9 cursor-pointer"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>

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
              className="rounded-xl text-muted-foreground hover:text-foreground gap-1.5 h-9 cursor-pointer px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
