"use client";

import { type WorkspaceMemberPreview } from "@/types/workspace";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

export function WorkspaceAvatarGroup({ members }: { members?: WorkspaceMemberPreview[] }) {
  if (!members || members.length === 0) return null;

  // Max avatars to show
  const MAX = 4;
  const visible = members.slice(0, MAX);
  const extra = members.length - MAX;

  return (
    <div className="flex items-center transition-all duration-300 sm:group-hover:opacity-0" suppressHydrationWarning>
      <AvatarGroup>
        {visible.map((m) => (
          <Avatar key={m.id} size="sm">
            <AvatarImage src={m.avatar_url || undefined} alt={m.name || m.email} />
            <AvatarFallback className="text-[10px]">
              {m.name?.[0]?.toUpperCase() || m.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {extra > 0 && <AvatarGroupCount className="text-[10px]">+{extra}</AvatarGroupCount>}
      </AvatarGroup>
    </div>
  );
}
