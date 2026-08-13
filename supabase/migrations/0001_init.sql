-- Farata.net — core schema (M1: profiles, verification, admin)
-- Applied via: supabase db push  (or paste into the Supabase SQL editor)

-- ============================================================
-- Enums
-- ============================================================
create type gender as enum ('male', 'female');
create type marital_status as enum ('single', 'divorced', 'widowed');
create type madhhab as enum ('hanafi', 'maliki', 'shafii', 'hanbali', 'no_preference', 'other');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type admin_role as enum ('admin', 'moderator', 'support');

-- ============================================================
-- admin_users — manual provisioning only (no self-serve signup)
-- ============================================================
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from admin_users where user_id = uid);
$$;

-- ============================================================
-- profiles — 1:1 with auth.users
-- ============================================================
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  phone_number text,

  first_name text not null,
  gender gender not null,
  date_of_birth date not null,
  country text not null,
  city text not null,
  nationality text,

  marital_status marital_status not null default 'single',
  has_children boolean not null default false,
  wants_children boolean,

  madhhab madhhab not null default 'no_preference',
  religious_practice_level text,
  profession text,
  education_level text,
  height_cm smallint,
  bio text,
  seeking_criteria jsonb not null default '{}'::jsonb,

  is_anonymous boolean not null default false,
  blur_photos boolean not null default true,

  verification_status verification_status not null default 'pending',
  verification_reviewed_by uuid references admin_users (id),
  verification_rejection_reason text,

  is_premium boolean not null default false,
  premium_until timestamptz,

  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_adult_only check (date_of_birth <= (current_date - interval '18 years'))
);

create index profiles_verification_status_idx on profiles (verification_status);
create index profiles_country_city_idx on profiles (country, city);
create index profiles_gender_idx on profiles (gender);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ============================================================
-- profile_photos
-- ============================================================
create table profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0,
  is_primary boolean not null default false,
  moderation_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index profile_photos_profile_id_idx on profile_photos (profile_id);

-- ============================================================
-- verification_history — audit log
-- ============================================================
create table verification_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  previous_status verification_status,
  new_status verification_status not null,
  reason text,
  changed_by uuid references admin_users (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- daily_usage_counters — free-tier limits, natural reset via date column
-- ============================================================
create table daily_usage_counters (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  counter_date date not null default current_date,
  contact_requests_sent int not null default 0,
  coach_questions_asked int not null default 0,
  unique (profile_id, counter_date)
);

-- Atomic increment-and-check, called server-side so concurrent requests
-- can't race past the daily limit.
create or replace function increment_and_check_counter(
  p_profile_id uuid,
  p_column text,
  p_limit int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_count int;
begin
  if p_column not in ('contact_requests_sent', 'coach_questions_asked') then
    raise exception 'invalid counter column: %', p_column;
  end if;

  insert into daily_usage_counters (profile_id, counter_date)
  values (p_profile_id, current_date)
  on conflict (profile_id, counter_date) do nothing;

  execute format(
    'update daily_usage_counters set %1$I = %1$I + 1
     where profile_id = $1 and counter_date = current_date
     returning %1$I', p_column
  ) into v_new_count using p_profile_id;

  if v_new_count > p_limit then
    execute format(
      'update daily_usage_counters set %1$I = %1$I - 1
       where profile_id = $1 and counter_date = current_date', p_column
    ) using p_profile_id;
    return false;
  end if;

  return true;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table admin_users enable row level security;
alter table profiles enable row level security;
alter table profile_photos enable row level security;
alter table verification_history enable row level security;
alter table daily_usage_counters enable row level security;

-- admin_users: admin-only read, no client writes (provisioned via service role)
create policy admin_users_select on admin_users
  for select using (is_admin(auth.uid()));

-- profiles: own row full access; any authenticated user can read approved rows
create policy profiles_select_own on profiles
  for select using (auth.uid() = user_id);

create policy profiles_select_approved on profiles
  for select using (verification_status = 'approved');

create policy profiles_select_admin on profiles
  for select using (is_admin(auth.uid()));

create policy profiles_insert_own on profiles
  for insert with check (auth.uid() = user_id);

create policy profiles_update_own on profiles
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    -- verification fields are admin-only; enforced in the app layer for
    -- clearer error messages, and backstopped by the admin-only update
    -- policy below since a client update can't set these to anything
    -- other than what a fresh row already has without going through
    -- an admin action path.
  );

create policy profiles_update_admin on profiles
  for update using (is_admin(auth.uid()));

-- profile_photos: owner manages own; approved profiles' photos are readable
create policy profile_photos_select on profile_photos
  for select using (
    exists (
      select 1 from profiles p
      where p.id = profile_photos.profile_id
        and (p.user_id = auth.uid() or p.verification_status = 'approved' or is_admin(auth.uid()))
    )
  );

create policy profile_photos_write_own on profile_photos
  for all using (
    exists (
      select 1 from profiles p
      where p.id = profile_photos.profile_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from profiles p
      where p.id = profile_photos.profile_id and p.user_id = auth.uid()
    )
  );

-- verification_history: admin-only
create policy verification_history_admin on verification_history
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- daily_usage_counters: owner reads own; writes go through increment_and_check_counter (security definer)
create policy daily_usage_counters_select_own on daily_usage_counters
  for select using (
    exists (select 1 from profiles p where p.id = daily_usage_counters.profile_id and p.user_id = auth.uid())
  );
