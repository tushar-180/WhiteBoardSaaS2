"use client";

import { motion } from "motion/react";

import { useSettingsStore, type SettingsTab } from "@/store/settings-store";
import {
  UserCircle,
  Briefcase,
  Bell,
  Palette,
  ShieldAlert,
  CreditCard,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems: { id: SettingsTab; label: string; icon: React.ElementType }[] =
  [
    { id: "profile", label: "Profile", icon: UserCircle },
    { id: "workspaces", label: "My Workspaces", icon: Briefcase },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: ShieldAlert },
  ];

export function SettingsSidebar() {
  const { activeTab, setActiveTab, setIsOpen } = useSettingsStore();

  return (
    <div className="w-full md:w-[250px] shrink-0 md:border-r border-white/5 bg-transparent flex flex-col h-auto md:h-full relative z-10">
      {/* Header with title and close button */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 md:py-6">
        <h2 className="font-bold text-xl tracking-tight">Settings</h2>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-white/10 rounded-full"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Nav items - icon only row on mobile, full text on desktop */}
      <nav className="flex md:flex-col justify-between md:justify-start overflow-visible md:overflow-y-auto gap-1 md:gap-2 px-6 py-3 md:px-4 md:py-4 md:flex-1 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex items-center justify-center md:justify-start gap-3 p-2.5 md:px-4 md:py-3 rounded-full md:rounded-xl text-sm font-semibold transition-colors cursor-pointer shrink-0 z-10 group",
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-white/10 border border-white/10 rounded-full md:rounded-xl -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <Icon
                className={cn(
                  "w-[22px] h-[22px] md:w-5 md:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-white drop-shadow-sm" : "text-muted-foreground",
                )}
              />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop-only footer */}
      <div className="p-4 border-t border-white/5 hidden md:flex items-center justify-center bg-transparent backdrop-blur-md">
        <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Zentrox Settings</p>
      </div>
    </div>
  );
}
