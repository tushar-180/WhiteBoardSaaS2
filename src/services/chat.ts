import { createClient } from "@/utils/supabase/server";
import { type BoardMessage } from "@/types/chat";

export async function fetchBoardMessages(
  boardId: string,
  workspaceId: string,
): Promise<BoardMessage[]> {
  const supabase = await createClient();

  // Fetch messages with sender profile and parent message
  const { data: messagesData, error: messagesError } = await supabase
    .from("board_messages")
    .select(
      `
      *,
      profiles (id, name, avatar_url),
      reply_to:reply_to_message_id (
        id,
        content,
        user_id,
        profiles (id, name, avatar_url)
      )
    `,
    )
    .eq("board_id", boardId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Database error in fetchBoardMessages:", messagesError);
    throw new Error(messagesError.message);
  }

  if (!messagesData || messagesData.length === 0) {
    return [];
  }

  // Fetch active workspace members
  const { data: membersData, error: membersError } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId);

  if (membersError) {
    console.error("Database error fetching workspace members:", membersError);
    throw new Error(membersError.message);
  }

  const activeUserIds = new Set(membersData?.map((m) => m.user_id) || []);

  // Map messages and assign is_active_member
  return messagesData.map((msg: any) => ({
    ...msg,
    // Workaround for Supabase returning single-object or array based on joins
    profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles,
    reply_to: Array.isArray(msg.reply_to) ? msg.reply_to[0] : msg.reply_to,
    is_active_member: activeUserIds.has(msg.user_id),
  })) as BoardMessage[];
}

export async function insertBoardMessage(
  boardId: string,
  userId: string,
  content: string,
  replyToMessageId?: string | null,
): Promise<BoardMessage> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("board_messages")
    .insert({
      board_id: boardId,
      user_id: userId,
      content,
      reply_to_message_id: replyToMessageId || null,
    })
    .select(
      `
      *,
      profiles (id, name, avatar_url),
      reply_to:reply_to_message_id (
        id,
        content,
        user_id,
        profiles (id, name, avatar_url)
      )
    `,
    )
    .single();

  if (error) {
    console.error("Database error in insertBoardMessage:", error);
    throw new Error(error.message);
  }

  // By definition, if the user just inserted the message, they are likely active.
  // But to be consistent, we can just return true.
  return {
    ...data,
    profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
    reply_to: Array.isArray(data.reply_to) ? data.reply_to[0] : data.reply_to,
    is_active_member: true,
  } as unknown as BoardMessage;
}
