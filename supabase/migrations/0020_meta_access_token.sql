-- FarataNikah — let admins paste their Meta Conversions API access token
-- directly in /admin/settings instead of needing an env var + redeploy.
--
-- Unlike meta_pixel_id (public by design — it has to reach the browser to
-- load the tracking script), this token can send events on the ad
-- account's behalf and must never be readable by anon/authenticated
-- clients. Column-level grants scope SELECT to only the public columns —
-- same technique already used on conversations/messages for is_read —
-- while the existing app_settings_update_admin row policy still lets an
-- admin's own session write it (service-role reads it back for sending).

alter table app_settings add column meta_access_token text;

revoke select on app_settings from anon, authenticated;
grant select (id, meta_pixel_id, updated_at) on app_settings to anon, authenticated;
