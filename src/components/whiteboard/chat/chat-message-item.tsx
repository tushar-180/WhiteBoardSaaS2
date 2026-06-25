import { useState } from "react";
import { MessageSquareReply } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type BoardMessage } from "@/types/chat";
import { formatMessageTime } from "@/utils/chat";
import { useChatStore } from "@/store/use-chat-store";
import { useMemberStore } from "@/store/use-member-store";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: BoardMessage;
  isCurrentUser: boolean;
}

export function ChatMessageItem({ message, isCurrentUser }: ChatMessageItemProps) {
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const needsExpansion = message.content.length > 300 || message.content.split("\n").length > 6;

  const senderName = message.profiles?.name || "Unknown";
  const avatarUrl = message.profiles?.avatar_url || "";
  const initials = senderName.substring(0, 2).toUpperCase();

  const isInactive = message.is_active_member === false;

  const members = useMemberStore((state) => state.members);

  const renderContentWithMentions = (content: string) => {
    // Match @<email> mentions
    const parts = content.split(/(@<[^>]+>)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@<") && part.endsWith(">")) {
        const email = part.slice(2, -1);
        const member = members.find((m) => m.email === email);
        const displayName = member?.name || email;
        return (
          <span key={i} className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tracking-tight mx-0.5 align-baseline", isCurrentUser ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary")}>
            @{displayName}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={cn("group flex gap-3 w-full", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className={cn("h-8 w-8 flex-shrink-0 mt-1", isInactive && "grayscale opacity-70")}>
        <AvatarImage src={avatarUrl} alt={senderName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1 max-w-[80%]", isCurrentUser ? "items-end" : "items-start")}>
        <div className={cn("flex items-center gap-2", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
          <span className={cn("text-xs font-medium", isInactive && "text-muted-foreground")}>
            {senderName}
            {isInactive && " (Former)"}
          </span>
          <span className="text-[10px] text-muted-foreground">{formatMessageTime(message.created_at)}</span>
        </div>

        <div className={cn("flex items-center gap-2 relative max-w-full", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
          <div
            className={cn(
              "px-3 py-2 rounded-lg text-sm flex flex-col gap-1.5 min-w-0",
              isCurrentUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted text-foreground rounded-tl-none",
              isInactive && "grayscale opacity-70"
            )}
            style={{ maxWidth: "100%" }}
          >
            {message.reply_to && (
              <div className={cn(
                "text-[10px] p-1.5 rounded border-l-4 w-full line-clamp-2 text-left",
                isCurrentUser 
                  ? "bg-black/10 border-primary-foreground/50" 
                  : "bg-background/50 border-primary/50"
              )}>
                <span className="font-semibold block mb-0.5 text-[11px] truncate">{message.reply_to.profiles?.name || "Unknown"}</span>
                <span className="opacity-90 break-words">{message.reply_to.content}</span>
              </div>
            )}
            
            <div className={cn("whitespace-pre-wrap break-words break-all leading-relaxed overflow-hidden", !isExpanded && needsExpansion && "line-clamp-6")}>
              {renderContentWithMentions(message.content)}
            </div>

            {needsExpansion && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn("text-[11px] font-semibold mt-0.5 hover:underline text-left", isCurrentUser ? "text-primary-foreground/80" : "text-primary/80")}
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {!isCurrentUser && (
            <button
              type="button"
              onClick={() => setReplyingTo(message)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground shrink-0"
              title="Reply"
            >
              <MessageSquareReply className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
