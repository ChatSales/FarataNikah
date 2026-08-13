-- FarataNikah — M7: voice messages (Premium)

create type message_type as enum ('text', 'voice');

alter table messages
  add column message_type message_type not null default 'text',
  add column voice_storage_path text,
  add column voice_duration_seconds smallint,
  alter column content drop not null;

alter table messages
  add constraint messages_content_or_voice check (
    (message_type = 'text' and content is not null)
    or (message_type = 'voice' and voice_storage_path is not null)
  );

-- Private bucket. Same pattern as profile-photos (0002_storage.sql): objects
-- live under `${auth.uid()}/...` so the uploader's own RLS-bound client can
-- write, and playback for the *other* conversation participant is minted
-- server-side with the service-role client after checking they're actually
-- part of the conversation — not encoded in storage RLS.
insert into storage.buckets (id, name, public)
values ('voice-messages', 'voice-messages', false)
on conflict (id) do nothing;

create policy "voice_messages_owner_all" on storage.objects
  for all
  using (bucket_id = 'voice-messages' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'voice-messages' and (storage.foldername(name))[1] = auth.uid()::text);
