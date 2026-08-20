-- FarataNikah — tracks when a member dismisses ("Plus tard") the Boost
-- promo modal, so a daily cron can follow up a few days later instead of
-- losing the lead entirely. Reset to null once a follow-up notification
-- has been sent, so each dismissal only ever triggers one reminder.
alter table profiles add column boost_promo_dismissed_at timestamptz;
