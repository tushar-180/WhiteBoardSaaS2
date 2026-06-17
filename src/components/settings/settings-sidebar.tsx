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
    <div className="w-full md:w-[250px] shrink-0 border-r border-border/50 bg-muted/20 flex flex-col h-full">
      <div className="p-4 flex items-center justify-between border-b border-border/50 md:border-none md:pb-2">
        <h2 className="font-semibold text-lg">Settings</h2>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border/50 hidden md:flex items-center justify-center">
         <p className="text-xs text-muted-foreground">Zentrox Settings</p>
      </div>
    </div>
  );
}
