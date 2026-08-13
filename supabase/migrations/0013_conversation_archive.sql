-- FarataNikah — M9: per-member conversation archiving
--
-- Archiving has to be personal (one side tidies their inbox, the other
-- keeps chatting normally) so it can't reuse conversations.status — that
-- column is shared and sendMessageAction already treats any non-"active"
-- value as blocked for BOTH participants (that's what the block feature
-- relies on). Two per-side flags keep archiving purely cosmetic.

alter table conversations
  add column archived_by_a boolean not null default false,
  add column archived_by_b boolean not null default false;
