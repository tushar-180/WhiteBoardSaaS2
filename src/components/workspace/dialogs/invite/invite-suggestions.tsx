"use client";

import { type Profile } from "@/types/profile";

interface InviteSuggestionsProps {
  suggestions: Profile[];
  onSelect: (email: string) => void;
}

export function InviteSuggestions({ suggestions, onSelect }: InviteSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-popover/95 border border-border/80 rounded-xl shadow-lg p-1 space-y-0.5 max-h-48 overflow-y-auto backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider border-b border-border/40">
        Registered Users
      </div>
      {suggestions.map((profile) => (
        <button
          key={profile.id}
          type="button"
          onMouseDown={() => onSelect(profile.email)}
          className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-muted/80 flex flex-col gap-0.5 transition-colors cursor-pointer"
        >
          <span className="font-semibold text-foreground">
            {profile.name || profile.email.split("@")[0]}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {profile.email}
          </span>
        </button>
      ))}
    </div>
  );
}
