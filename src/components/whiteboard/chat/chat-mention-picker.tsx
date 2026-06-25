import { useMemberStore } from "@/store/use-member-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type WorkspaceMemberWithProfile } from "@/types/workspace";

interface ChatMentionPickerProps {
  searchQuery: string;
  onSelect: (member: WorkspaceMemberWithProfile) => void;
}

export function ChatMentionPicker({ searchQuery, onSelect }: ChatMentionPickerProps) {
  const members = useMemberStore((state) => state.members);

  // Filter members by name or email
  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    const name = (m.name || "").toLowerCase();
    const email = (m.email || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  if (filteredMembers.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 w-56 rounded-md border bg-background shadow-md overflow-hidden z-50">
      <div className="max-h-40 overflow-y-auto">
        <ul className="py-1">
          {filteredMembers.map((m) => {
            const name = m.name || "Unknown";
            const initials = name.substring(0, 2).toUpperCase();
            return (
              <li
                key={m.id}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onSelect(m)}
              >
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={m.avatar_url || ""} alt={name} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-[11px] text-muted-foreground">{m.email}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
