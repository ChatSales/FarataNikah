-- FarataNikah — referral program. referral_code is derived from the
-- profile's own id (first 8 hex chars, no dashes) so every profile has a
-- shareable code with zero generation/uniqueness logic to maintain.
-- referred_by links a profile to whoever's code they signed up through;
-- referral_reward_claimed guards the one-time Boost-credit payout to the
-- referrer so it can only fire once per referred profile (mirrors the
-- completion_reward_claimed pattern).
alter table profiles add column referral_code text
  generated always as (substr(replace(id::text, '-', ''), 1, 8)) stored;
create index profiles_referral_code_idx on profiles (referral_code);

alter table profiles add column referred_by uuid references profiles(id) on delete set null;
alter table profiles add column referral_reward_claimed boolean not null default false;
