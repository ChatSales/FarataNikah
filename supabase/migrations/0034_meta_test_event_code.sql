-- FarataNikah — optional Meta Conversions API test_event_code, so an admin
-- can paste the code from Events Manager -> Test Events, watch server-side
-- events show up live there, then clear it once confirmed. Same privacy
-- posture as meta_access_token (migration 0020): not in the anon/
-- authenticated column grant, only readable via the service-role client.
alter table app_settings add column meta_test_event_code text;
