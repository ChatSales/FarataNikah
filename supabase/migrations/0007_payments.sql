-- Farata.net — M5: Premium subscriptions via Moneroo

create type subscription_plan as enum ('free', 'premium_monthly');
create type subscription_status as enum ('active', 'canceled', 'expired', 'past_due');
create type payment_transaction_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  plan subscription_plan not null default 'premium_monthly',
  status subscription_status not null default 'active',
  provider_subscription_id text,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_profile_id_idx on subscriptions (profile_id);
create index subscriptions_status_period_end_idx on subscriptions (status, current_period_end);

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

create table payment_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  subscription_id uuid references subscriptions (id) on delete set null,
  provider_transaction_id text not null,
  amount_fcfa integer not null,
  currency text not null default 'XOF',
  status payment_transaction_status not null default 'pending',
  payment_method text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (provider_transaction_id)
);

create index payment_transactions_profile_id_idx on payment_transactions (profile_id);

create trigger payment_transactions_set_updated_at
  before update on payment_transactions
  for each row execute function set_updated_at();

alter table subscriptions enable row level security;
alter table payment_transactions enable row level security;

-- Subscriptions only ever change via the Moneroo webhook and the expiry
-- cron, both using the service-role client (bypasses RLS) — members can
-- read their own subscription but never write it directly.
create policy subscriptions_select_own on subscriptions
  for select using (
    exists (select 1 from profiles p where p.id = subscriptions.profile_id and p.user_id = auth.uid())
  );

create policy subscriptions_admin on subscriptions
  for select using (is_admin(auth.uid()));

-- The checkout action inserts a "pending" row for its own profile under the
-- user's own session (before redirecting to Moneroo); the webhook (service
-- role) is what ever flips it to succeeded/failed.
create policy payment_transactions_select_own on payment_transactions
  for select using (
    exists (select 1 from profiles p where p.id = payment_transactions.profile_id and p.user_id = auth.uid())
  );

create policy payment_transactions_insert_own on payment_transactions
  for insert with check (
    exists (select 1 from profiles p where p.id = payment_transactions.profile_id and p.user_id = auth.uid())
  );

create policy payment_transactions_admin on payment_transactions
  for select using (is_admin(auth.uid()));
