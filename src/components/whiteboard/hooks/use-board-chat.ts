import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getBoardMessagesAction } from "@/actions/chat";
import { useChatStore } from "@/store/use-chat-store";
import { type BoardMessage } from "@/types/chat";

export function useBoardChat(boardId: string, workspaceId: string) {
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const resetChat = useChatStore((state) => state.resetChat);
  const setLoading = useChatStore((state) => state.setLoading);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();
    
    // Reset chat state when switching boards
    resetChat();

    // 1. Fetch initial messages
    async function fetchInitialMessages() {
      try {
        const data = await getBoardMessagesAction(boardId, workspaceId);
        if (isMounted) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch initial messages:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInitialMessages();

    // 2. Subscribe to new messages
    const channel = supabase
      .channel(`board_messages:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "board_messages",
          filter: `board_id=eq.${boardId}`,
        },
        async (payload) => {
          // Since the realtime payload only contains the base row data without joins,
          // we should fetch the complete message (with profiles & reply_to) from the DB 
          // to ensure we have the avatar and sender name.
          // In a high-volume chat, this could be optimized, but it's safe for now.
          const newMessageId = payload.new.id;
          
          const { data, error } = await supabase
            .from("board_messages")
            .select(`
              *,
              profiles (id, name, avatar_url),
              reply_to:reply_to_message_id (
                id,
                content,
                user_id,
                profiles (id, name, avatar_url)
              )
            `)
            .eq("id", newMessageId)
            .single();

          if (!error && data && isMounted) {
            const formattedMsg = {
              ...data,
              profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
              reply_to: Array.isArray(data.reply_to) ? data.reply_to[0] : data.reply_to,
              // Check active status - if they just sent a message, they must be active
              is_active_member: true
            } as unknown as BoardMessage;
            
            addMessage(formattedMsg);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [boardId, workspaceId]);
}
