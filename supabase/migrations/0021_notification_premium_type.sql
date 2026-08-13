-- FarataNikah — adds the "premium_activated" notification, fired from the
-- Moneroo webhook when a payment turns a profile premium, so the
-- Notifications page's "Premium" tab has something to show.

alter type notification_type add value 'premium_activated';
