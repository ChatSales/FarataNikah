-- FarataNikah — harden the block feature at the RLS layer.
--
-- Blocking (M8) was enforced only in the application (Discover query,
-- profile page, contact-request action) — a client using the Supabase
-- anon key directly could still SELECT a blocked profile, since
-- profiles_select_approved never checked blocked_profiles. Two
-- security-definer helpers avoid the RLS-recursion problem that would
-- come from having profiles' own policy query profiles/blocked_profiles
-- under the caller's normal (RLS-restricted) privileges.

create or replace function my_profile_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from profiles where user_id = auth.uid();
$$;

create or replace function is_blocked_between(profile_a uuid, profile_b uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from blocked_profiles
    where (blocker_profile_id = profile_a and blocked_profile_id = profile_b)
       or (blocker_profile_id = profile_b and blocked_profile_id = profile_a)
  );
$$;

drop policy profiles_select_approved on profiles;
create policy profiles_select_approved on profiles
  for select using (
    verification_status = 'approved'
    and not is_blocked_between(my_profile_id(), profiles.id)
  );

drop policy contact_requests_insert on contact_requests;
create policy contact_requests_insert on contact_requests
  for insert with check (
    exists (select 1 from profiles p where p.id = contact_requests.sender_profile_id and p.user_id = auth.uid())
    and not is_blocked_between(contact_requests.sender_profile_id, contact_requests.recipient_profile_id)
  );
