-- FarataNikah — M8: block & report a profile

create table blocked_profiles (
  id uuid primary key default gen_random_uuid(),
  blocker_profile_id uuid not null references profiles (id) on delete cascade,
  blocked_profile_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint blocked_profiles_no_self check (blocker_profile_id <> blocked_profile_id),
  unique (blocker_profile_id, blocked_profile_id)
);

create index blocked_profiles_blocker_idx on blocked_profiles (blocker_profile_id);
create index blocked_profiles_blocked_idx on blocked_profiles (blocked_profile_id);

alter table blocked_profiles enable row level security;

create policy blocked_profiles_select_own on blocked_profiles
  for select using (
    exists (select 1 from profiles p where p.id = blocked_profiles.blocker_profile_id and p.user_id = auth.uid())
  );

create policy blocked_profiles_write_own on blocked_profiles
  for all using (
    exists (select 1 from profiles p where p.id = blocked_profiles.blocker_profile_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from profiles p where p.id = blocked_profiles.blocker_profile_id and p.user_id = auth.uid())
  );

create type profile_report_reason as enum (
  'fake_profile',
  'inappropriate_content',
  'harassment',
  'already_married_hidden',
  'scam',
  'other'
);
create type profile_report_status as enum ('pending_review', 'confirmed', 'dismissed');

create table profile_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references profiles (id) on delete cascade,
  reported_profile_id uuid not null references profiles (id) on delete cascade,
  reason profile_report_reason not null,
  details text,
  status profile_report_status not null default 'pending_review',
  reviewed_by uuid references admin_users (id),
  created_at timestamptz not null default now(),

  constraint profile_reports_no_self check (reporter_profile_id <> reported_profile_id)
);

create index profile_reports_status_idx on profile_reports (status);

alter table profile_reports enable row level security;

create policy profile_reports_insert_own on profile_reports
  for insert with check (
    exists (select 1 from profiles p where p.id = profile_reports.reporter_profile_id and p.user_id = auth.uid())
  );

-- Reporters don't get to read the queue (avoids leaking other members' reports);
-- only admins can select/update.
create policy profile_reports_admin on profile_reports
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
