-- FarataNikah — fix: conversations/messages had no UPDATE RLS policy at all
--
-- Discovered while testing M9's read-tracking: marking a message read
-- (actions on app/(app)/app/messages/[id]/page.tsx) and updating
-- conversations.last_message_at (actions/messages.ts, since M3) were both
-- silently no-ops — PostgREST returns success with zero rows affected when
-- RLS filters out every row a client tries to UPDATE, so nothing ever
-- surfaced as an error. blockProfileAction's "flip conversation to blocked"
-- (M8) and the new archive toggles (M9) had the exact same gap.
--
-- Column grants scope what a participant can actually change — e.g. a
-- participant must not be able to rewrite a message's `content` or
-- `moderation_status` via a raw PostgREST call just because they're allowed
-- to flip `is_read` on their own view of the conversation.

create policy messages_update_participant on messages
  for update using (
    exists (
      select 1 from conversations c
      join profiles p on p.id in (c.profile_a_id, c.profile_b_id)
      where c.id = messages.conversation_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from conversations c
      join profiles p on p.id in (c.profile_a_id, c.profile_b_id)
      where c.id = messages.conversation_id and p.user_id = auth.uid()
    )
  );

revoke update on messages from authenticated;
grant update (is_read) on messages to authenticated;

create policy conversations_update_participant on conversations
  for update using (
    exists (select 1 from profiles p where p.id = conversations.profile_a_id and p.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = conversations.profile_b_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from profiles p where p.id = conversations.profile_a_id and p.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = conversations.profile_b_id and p.user_id = auth.uid())
  );

revoke update on conversations from authenticated;
grant update (last_message_at, status, archived_by_a, archived_by_b) on conversations to authenticated;
