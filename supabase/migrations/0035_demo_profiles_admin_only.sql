-- FarataNikah — keep the seeded demo profiles around for future testing,
-- but stop them from being visible to real members. profiles_select_admin
-- already grants admins unconditional access (migration 0001), so tagging
-- is_demo and excluding it from profiles_select_approved is enough: admins
-- still see these rows via the other policy, everyone else doesn't.
alter table profiles add column is_demo boolean not null default false;

update profiles set is_demo = true where email like '%@faratanikah-demo.com';

drop policy profiles_select_approved on profiles;
create policy profiles_select_approved on profiles
  for select using (
    verification_status = 'approved'
    and not is_blocked_between(my_profile_id(), profiles.id)
    and not is_demo
  );
