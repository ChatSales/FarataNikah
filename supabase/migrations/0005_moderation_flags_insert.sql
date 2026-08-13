-- Fixes a real bug found in M3 e2e testing: moderation_flags_admin ("for
-- all") locked out every operation to admins only, but sendMessageAction
-- runs as the sending user's own session and must insert a flag row when
-- Claude flags/blocks their message. The category/severity/reasoning
-- values are always server-computed by lib/claude/moderation.ts, never
-- taken from user input, so allowing a user to insert a flag referencing
-- their own message is not an integrity risk — it's the same trust level
-- as the message insert itself.

create policy moderation_flags_insert_own on moderation_flags
  for insert with check (
    exists (select 1 from profiles p where p.id = moderation_flags.profile_id and p.user_id = auth.uid())
  );
