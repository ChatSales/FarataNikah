-- FarataNikah — M9: in-app notifications (bell + badge)

create type notification_type as enum (
  'contact_request_received',
  'contact_request_accepted',
  'profile_approved',
  'profile_rejected'
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_profile_id_idx on notifications (profile_id, created_at desc);

alter table notifications enable row level security;

-- Notifications are always created server-side via the service-role client
-- (the actor triggering one — e.g. sending a contact request — isn't the
-- recipient, so a self-service RLS insert policy doesn't apply here, same
-- reasoning as the admin-client writes already used for payments/voice
-- storage cleanup). Members only ever read/update their own.
create policy notifications_select_own on notifications
  for select using (
    exists (select 1 from profiles p where p.id = notifications.profile_id and p.user_id = auth.uid())
  );

create policy notifications_update_own on notifications
  for update using (
    exists (select 1 from profiles p where p.id = notifications.profile_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from profiles p where p.id = notifications.profile_id and p.user_id = auth.uid())
  );
