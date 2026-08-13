-- Farata.net — M3: messaging, moderation, favorites, profile visits

create type message_moderation_status as enum ('approved', 'flagged', 'blocked');
create type moderation_flag_type as enum (
  'inappropriate_content',
  'contact_info_exchange',
  'harassment',
  'spam',
  'other'
);
create type moderation_severity as enum ('low', 'medium', 'high');
create type moderation_flag_status as enum ('pending_review', 'confirmed', 'dismissed');

-- ============================================================
-- messages
-- ============================================================
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_profile_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  moderation_status message_moderation_status not null default 'approved',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on messages (conversation_id, created_at);

-- ============================================================
-- moderation_flags — admin-only, logs Claude's moderation reasoning
-- ============================================================
create table moderation_flags (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  flag_type moderation_flag_type not null,
  severity moderation_severity not null,
  ai_reasoning text,
  status moderation_flag_status not null default 'pending_review',
  reviewed_by uuid references admin_users (id),
  created_at timestamptz not null default now()
);

create index moderation_flags_status_idx on moderation_flags (status);

-- ============================================================
-- favorites
-- ============================================================
create table favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  favorited_profile_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint favorites_no_self check (profile_id <> favorited_profile_id),
  unique (profile_id, favorited_profile_id)
);

create index favorites_favorited_profile_id_idx on favorites (favorited_profile_id, created_at desc);

-- ============================================================
-- profile_visits
-- ============================================================
create table profile_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_profile_id uuid not null references profiles (id) on delete cascade,
  visited_profile_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index profile_visits_visited_idx on profile_visits (visited_profile_id, created_at desc);

-- ============================================================
-- RLS
-- ============================================================
alter table messages enable row level security;
alter table moderation_flags enable row level security;
alter table favorites enable row level security;
alter table profile_visits enable row level security;

create policy messages_select on messages
  for select using (
    exists (
      select 1 from conversations c
      join profiles p on p.id in (c.profile_a_id, c.profile_b_id)
      where c.id = messages.conversation_id and p.user_id = auth.uid()
    )
    or is_admin(auth.uid())
  );

create policy messages_insert on messages
  for insert with check (
    exists (select 1 from profiles p where p.id = messages.sender_profile_id and p.user_id = auth.uid())
    and exists (
      select 1 from conversations c
      join profiles p on p.id in (c.profile_a_id, c.profile_b_id)
      where c.id = messages.conversation_id and p.user_id = auth.uid()
    )
  );

-- Senders can mark their own flagged/blocked status via moderation, but
-- read access to the moderation record itself is admin-only.
create policy moderation_flags_admin on moderation_flags
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy favorites_select_own on favorites
  for select using (
    exists (select 1 from profiles p where p.id = favorites.profile_id and p.user_id = auth.uid())
  );

-- Premium-gated at the RLS layer (not just the UI): only a premium
-- viewer's own profile can see who favorited *them*, matching the
-- "voir qui t'a mis en favori" paid feature from the pricing plan.
create policy favorites_select_incoming_premium on favorites
  for select using (
    exists (
      select 1 from profiles p
      where p.id = favorites.favorited_profile_id and p.user_id = auth.uid() and p.is_premium = true
    )
  );

create policy favorites_write_own on favorites
  for all using (
    exists (select 1 from profiles p where p.id = favorites.profile_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from profiles p where p.id = favorites.profile_id and p.user_id = auth.uid())
  );

create policy profile_visits_select_own on profile_visits
  for select using (
    exists (select 1 from profiles p where p.id = profile_visits.visitor_profile_id and p.user_id = auth.uid())
  );

-- "Voir qui a visité ton profil" — Premium only, enforced here too.
create policy profile_visits_select_incoming_premium on profile_visits
  for select using (
    exists (
      select 1 from profiles p
      where p.id = profile_visits.visited_profile_id and p.user_id = auth.uid() and p.is_premium = true
    )
  );

create policy profile_visits_insert_own on profile_visits
  for insert with check (
    exists (select 1 from profiles p where p.id = profile_visits.visitor_profile_id and p.user_id = auth.uid())
  );
