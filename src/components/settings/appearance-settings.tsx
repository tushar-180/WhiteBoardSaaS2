"use client";

import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground mt-1">Customize the look and feel of the application.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Theme Preference</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-col items-center justify-center p-4 border rounded-xl gap-3 transition-colors cursor-pointer",
                theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
              )}
            >
              <Sun className="w-8 h-8" />
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-col items-center justify-center p-4 border rounded-xl gap-3 transition-colors cursor-pointer",
                theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
              )}
            >
              <Moon className="w-8 h-8" />
              <span className="font-medium">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex flex-col items-center justify-center p-4 border rounded-xl gap-3 transition-colors cursor-pointer",
                theme === "system" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
              )}
            >
              <Monitor className="w-8 h-8" />
              <span className="font-medium">System</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
