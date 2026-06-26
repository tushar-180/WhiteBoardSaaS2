import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { useChatStore } from "@/store/use-chat-store";
import { sendBoardMessageAction } from "@/actions/chat";
import { ChatMentionPicker } from "./chat-mention-picker";
import { type WorkspaceMemberWithProfile } from "@/types/workspace";

export function ChatInput({ boardId, workspaceId }: { boardId: string; workspaceId: string }) {
  const [textContent, setTextContent] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<WorkspaceMemberWithProfile[]>([]);
  
  const replyingTo = useChatStore((state) => state.replyingTo);
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = textContent.trim();
    if (!text && selectedMembers.length === 0) return;

    // Construct full content: text + mention tags
    const mentionTags = selectedMembers.map((m) => `@<${m.email}>`).join(" ");
    const fullContent = [text, mentionTags].filter(Boolean).join(" ");
    const replyId = replyingTo?.id || null;

    // Instantly clear UI (Optimistic response)
    setTextContent("");
    setSelectedMembers([]);
    setReplyingTo(null);
    
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.overflowY = "hidden";
      inputRef.current.focus();
    }

    try {
      // Send in background
      await sendBoardMessageAction(
        workspaceId,
        boardId,
        fullContent,
        replyId,
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Backspace on empty input removes the last mention badge
    if (e.key === "Backspace" && textContent === "" && selectedMembers.length > 0) {
      setSelectedMembers((prev) => prev.slice(0, -1));
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    // Auto-resize logic
    target.style.height = "auto";
    const newHeight = Math.min(target.scrollHeight, 150);
    target.style.height = `${newHeight}px`;
    target.style.overflowY = target.scrollHeight > 150 ? "auto" : "hidden";

    const val = target.value;
    setTextContent(val);

    // Check for @ mention in the text content
    const lastWord = val.split(" ").pop();
    if (lastWord?.startsWith("@")) {
      setMentionQuery(lastWord.slice(1));
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (member: WorkspaceMemberWithProfile) => {
    // Remove the @query text from the input
    const words = textContent.split(" ");
    words.pop();
    setTextContent(words.join(" ") + (words.length > 0 ? " " : ""));

    // Add member badge if not already selected
    if (!selectedMembers.some((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }

    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const removeMention = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
  };

  const hasContent = textContent.trim() !== "" || selectedMembers.length > 0;

  return (
    <div className="border-t p-3 bg-background flex flex-col gap-2 relative">
      {replyingTo && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md text-xs">
          <div className="truncate text-muted-foreground flex-1">
            Replying to <span className="font-semibold">{replyingTo.profiles?.name || "Someone"}</span>: {replyingTo.content}
          </div>
          <button type="button" onClick={() => setReplyingTo(null)} className="ml-2 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {mentionQuery !== null && (
        <ChatMentionPicker
          searchQuery={mentionQuery}
          onSelect={handleSelectMention}
        />
      )}

      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <div className="flex-1 flex flex-wrap gap-1.5 items-center bg-secondary/30 border rounded-md px-2 py-1.5 min-h-[38px]">
          {selectedMembers.map((member) => (
            <span
              key={member.id}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
            >
              @{member.name || member.email}
              <button
                type="button"
                onClick={() => removeMention(member.id)}
                className="hover:text-primary/70 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={selectedMembers.length === 0 ? "Type a message..." : ""}
            className="flex-1 bg-transparent text-sm outline-none min-w-[60px] py-1 resize-none leading-relaxed"
            style={{ minHeight: "28px", maxHeight: "150px", overflowY: "hidden" }}
            value={textContent}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="submit"
          disabled={!hasContent}
          className="p-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
