-- FarataNikah — notification (and, once Brevo is configured, email) sent
-- once when a member crosses 14 days of inactivity.
alter type notification_type add value 'winback_reminder';
