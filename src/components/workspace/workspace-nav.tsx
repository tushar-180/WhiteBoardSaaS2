"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings-store";
import { ROUTES, ASSETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const NotificationInbox = dynamic(() => import("./notification-inbox").then((m) => ({ default: m.NotificationInbox })), { ssr: false });

interface WorkspaceNavProps {
  userEmail?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  logoHref?: string;
  planType?: "free" | "pro" | "ultra";
}

export function WorkspaceNav({ userEmail, userId, userName, userAvatar, logoHref = ROUTES.HOME, planType = "free" }: WorkspaceNavProps) {
  const [mounted, setMounted] = useState(false);
  const { setIsOpen, setActiveTab } = useSettingsStore();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const planStyles: Record<string, string> = {
    free: "bg-muted text-muted-foreground border-border/50",
    pro: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    ultra: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  };

  const planLabels: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    ultra: "Ultra",
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <div className={cn("sm:hidden text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border leading-none shadow-sm", planStyles[planType])}>
            {planLabels[planType]}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {userEmail && (
            <>
              <div className="flex items-center gap-1">
                <NotificationInbox userEmail={userEmail} userId={userId} />
                {mounted ? (
                  <AnimatedThemeToggler
                    duration={600}
                    theme={resolvedTheme as "light" | "dark"}
                    onThemeChange={(t) => setTheme(t)}
                    className="flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground h-4.5 w-4.5 transition-colors"
                  />
                ) : (
                  <div className="h-4.5 w-4.5" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(true)}
                  className="rounded-full text-muted-foreground hover:bg-muted hover:text-foreground h-9 w-9 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </div>

              <div className="h-6 w-[1px] bg-border/60 mx-1 hidden sm:block" />

              <button 
                onClick={() => { setActiveTab("profile"); setIsOpen(true); }}
                className="flex items-center gap-2 ml-1 mr-2 px-1.5 py-1.5 rounded-full hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30 cursor-pointer text-left"
              >
                <Avatar className="h-8 w-8 border border-border/50 shadow-sm shrink-0">
                  {userAvatar && <AvatarImage src={userAvatar} alt={userName || userEmail || "User"} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {userName ? userName.charAt(0).toUpperCase() : userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <span className="text-sm font-semibold text-foreground max-w-[120px] truncate">
                    {userName || (userEmail ? userEmail.split("@")[0] : "User")}
                  </span>
                  <div className={cn("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border leading-none shadow-sm", planStyles[planType])}>
                    {planLabels[planType]}
                  </div>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
