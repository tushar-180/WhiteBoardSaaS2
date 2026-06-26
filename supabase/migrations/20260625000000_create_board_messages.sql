CREATE TABLE public.board_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reply_to_message_id uuid REFERENCES public.board_messages(id) ON DELETE SET NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Note: RLS policies intentionally omitted for this feature phase
-- We will enable them later if necessary.
-- ALTER TABLE public.board_messages ENABLE ROW LEVEL SECURITY;

-- Add the table to the supabase_realtime publication to enable broadcasting
ALTER PUBLICATION supabase_realtime ADD TABLE public.board_messages;
