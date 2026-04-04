
-- Chat messages table for group chat and support
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'group',
  message text NOT NULL,
  sender_name text NOT NULL DEFAULT '',
  sender_avatar text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read group messages
CREATE POLICY "Users can read group messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (channel = 'group');

-- Users can read their own support messages
CREATE POLICY "Users can read own support messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (channel = 'support_' || auth.uid()::text);

-- Admins can read all messages
CREATE POLICY "Admins can read all messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can insert messages to group or their own support channel
CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      channel = 'group' OR
      channel = 'support_' || auth.uid()::text
    )
  );

-- Admins can insert messages to any channel
CREATE POLICY "Admins can send to any channel" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
