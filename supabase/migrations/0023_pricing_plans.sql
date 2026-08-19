-- FarataNikah — admin-editable pricing, replacing the hardcoded plan/tier
-- lists in lib/premium.ts and lib/boost-pricing.ts. Both the app (checkout,
-- settings) and the public landing page read from this table directly, so
-- a price change here takes effect immediately everywhere with no deploy.

create type pricing_plan_type as enum ('premium', 'boost');

create table pricing_plans (
  id text primary key,
  type pricing_plan_type not null,
  label text not null,
  price_fcfa integer not null check (price_fcfa >= 0),
  original_price_fcfa integer check (original_price_fcfa is null or original_price_fcfa >= 0),
  duration_days integer check (duration_days is null or duration_days > 0),
  duration_hours integer check (duration_hours is null or duration_hours > 0),
  boosts_included integer not null default 0,
  is_popular boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create trigger pricing_plans_set_updated_at
  before update on pricing_plans
  for each row execute function set_updated_at();

alter table pricing_plans enable row level security;

-- Readable by anyone, signed in or not — prices have to render on the
-- public marketing/pricing page as well as inside the app.
create policy pricing_plans_select_public on pricing_plans
  for select using (true);

create policy pricing_plans_admin_write on pricing_plans
  for insert with check (is_admin(auth.uid()));

create policy pricing_plans_admin_update on pricing_plans
  for update using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

create policy pricing_plans_admin_delete on pricing_plans
  for delete using (is_admin(auth.uid()));

insert into pricing_plans
  (id, type, label, price_fcfa, original_price_fcfa, duration_days, boosts_included, is_popular, sort_order)
values
  ('15days', 'premium', 'Premium 15 Jours', 3900, 7800, 15, 1, false, 1),
  ('1month', 'premium', 'Premium 1 Mois', 5900, 9900, 30, 3, true, 2),
  ('3months', 'premium', 'Premium 3 Mois', 9900, 14700, 90, 3, false, 3),
  ('6months', 'premium', 'Premium 6 Mois', 14900, 29400, 180, 6, false, 4);

insert into pricing_plans
  (id, type, label, price_fcfa, duration_hours, sort_order)
values
  ('boost_24h', 'boost', 'Boost 24h', 1500, 24, 1),
  ('boost_3d', 'boost', 'Boost 3 jours', 3000, 72, 2),
  ('boost_7d', 'boost', 'Boost 7 jours', 5000, 168, 3);
