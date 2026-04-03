
-- Allow users to update messages in their own conversations (for streaming)
CREATE POLICY "Users can update own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM conversations
  WHERE conversations.id = messages.conversation_id
  AND conversations.user_id = auth.uid()
));

-- Allow users to delete their own conversations
CREATE POLICY "Users can delete own conversations"
ON public.conversations FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Allow users to delete messages in their own conversations
CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM conversations
  WHERE conversations.id = messages.conversation_id
  AND conversations.user_id = auth.uid()
));
