-- FarataNikah — lightweight IP-based rate limiting for unauthenticated
-- auth endpoints (signup, login, password reset), which have no
-- profile_id to hang the existing per-profile daily counters off of.

create table rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_hits_bucket_idx on rate_limit_hits (bucket_key, created_at desc);

alter table rate_limit_hits enable row level security;

-- No policies at all, intentionally — this table is only ever touched via
-- the service-role admin client from inside Server Actions, never from a
-- browser session, so there's nothing for a client-facing RLS policy to
-- grant. RLS being enabled with zero policies means "deny all" for any
-- non-service-role caller, which is exactly the intent.
