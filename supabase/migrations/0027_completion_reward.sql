-- FarataNikah — one-time free Boost credit awarded the first time a
-- profile reaches 100% completion. This flag stops it from being granted
-- again if fields are later cleared and refilled back to 100%.
alter table profiles add column completion_reward_claimed boolean not null default false;
