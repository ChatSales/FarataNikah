-- FarataNikah — member-submitted testimonials, moderated by an admin
-- before showing on the public landing page (replacing/supplementing the
-- illustrative placeholder quotes already there).

create type testimonial_status as enum ('pending_review', 'approved', 'rejected');

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  quote text not null,
  status testimonial_status not null default 'pending_review',
  reviewed_by uuid references admin_users (id),
  created_at timestamptz not null default now()
);

create index testimonials_status_idx on testimonials (status);

alter table testimonials enable row level security;

create policy testimonials_select_own on testimonials
  for select using (
    exists (select 1 from profiles p where p.id = testimonials.profile_id and p.user_id = auth.uid())
  );

-- Approved quotes are shown to signed-out visitors on the landing page —
-- read through the anon-key public client (lib/supabase/public.ts), same
-- as app_settings.meta_pixel_id.
create policy testimonials_select_approved_public on testimonials
  for select using (status = 'approved');

create policy testimonials_insert_own on testimonials
  for insert with check (
    exists (select 1 from profiles p where p.id = testimonials.profile_id and p.user_id = auth.uid())
  );

create policy testimonials_admin_update on testimonials
  for update using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
