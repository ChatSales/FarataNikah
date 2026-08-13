-- FarataNikah — M10: multi-duration Premium plans + Boost credits

alter table payment_transactions add column plan_id text;

alter table profiles
  add column boost_credits integer not null default 0,
  add column boosted_until timestamptz;

create index profiles_boosted_until_idx on profiles (boosted_until) where boosted_until is not null;
