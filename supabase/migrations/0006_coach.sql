-- Farata.net — M4: Coach Amina (AI marriage coach)
-- One ongoing conversation per profile for MVP simplicity.

create type coach_message_role as enum ('user', 'assistant');

create table coach_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table coach_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references coach_conversations (id) on delete cascade,
  role coach_message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index coach_messages_conversation_id_idx on coach_messages (conversation_id, created_at);

alter table coach_conversations enable row level security;
alter table coach_messages enable row level security;

create policy coach_conversations_owner on coach_conversations
  for all using (
    exists (select 1 from profiles p where p.id = coach_conversations.profile_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from profiles p where p.id = coach_conversations.profile_id and p.user_id = auth.uid())
  );

create policy coach_messages_owner on coach_messages
  for all using (
    exists (
      select 1 from coach_conversations c
      join profiles p on p.id = c.profile_id
      where c.id = coach_messages.conversation_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from coach_conversations c
      join profiles p on p.id = c.profile_id
      where c.id = coach_messages.conversation_id and p.user_id = auth.uid()
    )
  );
