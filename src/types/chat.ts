export interface BoardMessageSender {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface BoardMessageReplyTo {
  id: string;
  content: string;
  user_id: string;
  profiles?: BoardMessageSender | null;
}

export interface BoardMessage {
  id: string;
  board_id: string;
  user_id: string;
  reply_to_message_id: string | null;
  content: string;
  created_at: string;
  profiles?: BoardMessageSender | null;
  reply_to?: BoardMessageReplyTo | null;
  is_active_member?: boolean;
}
