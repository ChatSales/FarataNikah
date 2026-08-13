-- FarataNikah — M7: pending profiles can browse the app but not message
-- (app-layer gating in actions/messages.ts + app/(app)/app/messages/*;
-- this migration backstops it at the RLS layer, same defense-in-depth
-- pattern used for the Premium favorites/profile_visits policies).

drop policy messages_insert on messages;

create policy messages_insert on messages
  for insert with check (
    exists (
      select 1 from profiles p
      where p.id = messages.sender_profile_id
        and p.user_id = auth.uid()
        and p.verification_status = 'approved'
    )
    and exists (
      select 1 from conversations c
      join profiles p on p.id in (c.profile_a_id, c.profile_b_id)
      where c.id = messages.conversation_id and p.user_id = auth.uid()
    )
  );
