-- FarataNikah — notification sent by the boost-reminder cron a few days
-- after a member dismisses the Boost promo modal without buying.
alter type notification_type add value 'boost_reminder';
