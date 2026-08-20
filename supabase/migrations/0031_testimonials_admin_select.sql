-- FarataNikah — migration 0030 gave admins UPDATE on testimonials but
-- forgot SELECT, so the admin moderation page couldn't see anyone else's
-- pending (non-approved) submissions to act on in the first place.
create policy testimonials_select_admin on testimonials
  for select using (is_admin(auth.uid()));
