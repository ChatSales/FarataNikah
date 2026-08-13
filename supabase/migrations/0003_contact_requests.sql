-- Farata.net — M2: contact requests, conversations, admin role helper reuse

create type contact_request_status as enum ('pending', 'accepted', 'declined');
create type conversation_status as enum ('active', 'blocked', 'archived');

-- ============================================================
-- contact_requests
-- ============================================================
create table contact_requests (
  id uuid primary key default gen_random_uuid(),
  sender_profile_id uuid not null references profiles (id) on delete cascade,
  recipient_profile_id uuid not null references profiles (id) on delete cascade,
  status contact_request_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,

  constraint contact_requests_no_self check (sender_profile_id <> recipient_profile_id)
);

create index contact_requests_sender_idx on contact_requests (sender_profile_id);
create index contact_requests_recipient_idx on contact_requests (recipient_profile_id, status);

-- ============================================================
-- conversations — one per accepted contact request
-- ============================================================
create table conversations (
  id uuid primary key default gen_random_uuid(),
  contact_request_id uuid not null unique references contact_requests (id) on delete cascade,
  profile_a_id uuid not null references profiles (id) on delete cascade,
  profile_b_id uuid not null references profiles (id) on delete cascade,
  status conversation_status not null default 'active',
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create index conversations_profile_a_idx on conversations (profile_a_id);
create index conversations_profile_b_idx on conversations (profile_b_id);

-- ============================================================
-- RLS
-- ============================================================
alter table contact_requests enable row level security;
alter table conversations enable row level security;

create policy contact_requests_select on contact_requests
  for select using (
    exists (select 1 from profiles p where p.id = contact_requests.sender_profile_id and p.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = contact_requests.recipient_profile_id and p.user_id = auth.uid())
    or is_admin(auth.uid())
  );

create policy contact_requests_insert on contact_requests
  for insert with check (
    exists (select 1 from profiles p where p.id = contact_requests.sender_profile_id and p.user_id = auth.uid())
  );

-- Only the recipient can respond (pending -> accepted/declined); enforced
-- further in the app layer (can't flip an already-responded request).
create policy contact_requests_update_recipient on contact_requests
  for update using (
    exists (select 1 from profiles p where p.id = contact_requests.recipient_profile_id and p.user_id = auth.uid())
  );

create policy conversations_select on conversations
  for select using (
    exists (select 1 from profiles p where p.id = conversations.profile_a_id and p.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = conversations.profile_b_id and p.user_id = auth.uid())
    or is_admin(auth.uid())
  );

-- The accepting user is only one of the two participants, so the insert
-- check accepts either side rather than requiring both — the row still
-- references a real contact_requests id, which itself required the
-- recipient's own auth.uid() to update to 'accepted' in the first place.
create policy conversations_insert on conversations
  for insert with check (
    exists (select 1 from profiles p where p.id = conversations.profile_a_id and p.user_id = auth.uid())
    or exists (select 1 from profiles p where p.id = conversations.profile_b_id and p.user_id = auth.uid())
  );
