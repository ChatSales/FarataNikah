-- Profile photos bucket. Private — reads for anyone other than the owner
-- go through a server-side signed-URL endpoint (not built in M1) so blur
-- mode / anonymous mode / verification status can gate visibility before a
-- URL is ever minted, rather than relying on storage RLS to encode that logic.

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

-- Objects must live under `${auth.uid()}/...` — enforced by path, not by a
-- lookup into profiles, so it works even before onboarding step 1 completes.
create policy "profile_photos_owner_all" on storage.objects
  for all
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
