-- FarataNikah — M7: cached AI compatibility scores (replaces pure heuristic)

create table compatibility_scores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  candidate_id uuid not null references profiles (id) on delete cascade,
  score smallint not null,
  reasoning text,
  computed_at timestamptz not null default now(),

  unique (profile_id, candidate_id)
);

create index compatibility_scores_profile_id_idx on compatibility_scores (profile_id);

alter table compatibility_scores enable row level security;

-- Scores are computed on the viewer's own request (never the candidate's)
-- and only ever read/written by that same viewer.
create policy compatibility_scores_select_own on compatibility_scores
  for select using (
    exists (select 1 from profiles p where p.id = compatibility_scores.profile_id and p.user_id = auth.uid())
  );

create policy compatibility_scores_write_own on compatibility_scores
  for all using (
    exists (select 1 from profiles p where p.id = compatibility_scores.profile_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from profiles p where p.id = compatibility_scores.profile_id and p.user_id = auth.uid())
  );
