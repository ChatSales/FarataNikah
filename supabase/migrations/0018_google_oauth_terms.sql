-- FarataNikah — Google OAuth support + unified CGU acceptance record
--
-- Email signup validated the CGU checkbox but never stored proof of
-- acceptance anywhere. Moving the checkbox to onboarding/basic-info (the
-- one mandatory first step for every new profile, regardless of whether
-- they signed up with email or Google) means one enforcement point covers
-- both auth methods, and now leaves an actual timestamped record.

alter table profiles add column terms_accepted_at timestamptz;
