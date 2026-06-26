import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/use-chat-store";
import { ChatMessageItem } from "./chat-message-item";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatMessageList({ currentUserId }: { currentUserId: string }) {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadNewMessages, setUnreadNewMessages] = useState(0);
  const isNearBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(messages.length);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
      setUnreadNewMessages(0);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Show button if we are scrolled up more than 100px from the bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      isNearBottomRef.current = isNearBottom;
      setShowScrollButton(!isNearBottom);

      if (isNearBottom) {
        setUnreadNewMessages(0);
      }
    }
  };

  useEffect(() => {
    const newMessagesCount = messages.length - prevMessagesLengthRef.current;
    
    // Only process if we actually got new messages
    if (newMessagesCount > 0) {
      const lastMessage = messages[messages.length - 1];
      const isMyMessage = lastMessage?.user_id === currentUserId;

      if (isNearBottomRef.current || isMyMessage) {
        // Auto scroll if at bottom or if the user sent the message themselves
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        setUnreadNewMessages(0);
      } else {
        // Not near bottom, increment counter
        setUnreadNewMessages((prev) => prev + newMessagesCount);
      }
    }
    
    // If messages were cleared (e.g. switched board)
    if (messages.length === 0) {
      setUnreadNewMessages(0);
      isNearBottomRef.current = true;
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, currentUserId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary/60" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className="flex-1 relative flex flex-col min-h-0">
      <div 
        className="flex-1 overflow-y-auto p-4" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="flex flex-col gap-4 pb-2">
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              isCurrentUser={msg.user_id === currentUserId}
            />
          ))}
        </div>
      </div>
      
      {showScrollButton && (
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full shadow-md z-10 opacity-90 hover:opacity-100 transition-opacity"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
          {unreadNewMessages > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
              {unreadNewMessages > 9 ? "9+" : unreadNewMessages}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
