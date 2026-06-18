"use client";

import { useSettingsStore, type SettingsTab } from "@/store/settings-store";
import { UserCircle, Briefcase, Bell, Palette, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "workspaces", label: "My Workspaces", icon: Briefcase },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: ShieldAlert },
];

export function SettingsSidebar() {
  const { activeTab, setActiveTab, setIsOpen } = useSettingsStore();

  return (
    <div className="w-full md:w-[250px] shrink-0 md:border-r border-border/50 bg-muted/20 flex flex-col h-auto md:h-full">
      {/* Header with title and close button */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <h2 className="font-semibold text-lg">Settings</h2>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Nav items - horizontal scroll on mobile, vertical on desktop */}
      <nav className="flex md:flex-col justify-start overflow-x-auto md:overflow-y-auto gap-1 md:gap-1 px-2 sm:px-4 md:px-0 py-2 md:py-0 md:flex-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col md:flex-row items-center justify-center md:w-full md:justify-start gap-0.5 md:gap-3 p-1 md:px-3 md:py-2.5 rounded-md text-xs md:text-sm font-medium transition-colors cursor-pointer shrink-0 min-w-12 md:min-w-0",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="text-[10px] leading-tight md:text-xs md:text-sm md:hidden">{item.label}</span>
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Desktop-only footer */}
      <div className="p-4 border-t border-border/50 hidden md:flex items-center justify-center">
         <p className="text-xs text-muted-foreground">Zentrox Settings</p>
      </div>
    </div>
  );
}
