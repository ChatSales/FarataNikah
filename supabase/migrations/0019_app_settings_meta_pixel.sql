-- FarataNikah — singleton app-wide settings (currently just the Meta Pixel
-- ID). A single fixed-id row rather than a key/value table since there's
-- only ever one of these; keeps reads a trivial `select ... limit 1`.

create table app_settings (
  id boolean primary key default true,
  meta_pixel_id text,
  updated_at timestamptz not null default now(),

  constraint app_settings_singleton check (id)
);

insert into app_settings (id) values (true);

create trigger app_settings_set_updated_at
  before update on app_settings
  for each row execute function set_updated_at();

alter table app_settings enable row level security;

-- Readable by anyone, signed in or not — the pixel has to load on the
-- public marketing pages too (that's the whole point of ad-campaign
-- tracking), and a Meta Pixel ID is a public identifier by design, the
-- same way a Google Analytics ID is visible in any page's source.
create policy app_settings_select_public on app_settings
  for select using (true);

create policy app_settings_update_admin on app_settings
  for update using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
