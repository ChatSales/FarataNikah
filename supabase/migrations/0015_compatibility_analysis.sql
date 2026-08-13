-- FarataNikah — M9: rich AI compatibility analysis (Premium), cached
-- alongside the existing score/reasoning. Computed lazily, on request,
-- not for every Discover candidate — a full analysis call is too slow/
-- costly to run in bulk like the base score already is.

alter table compatibility_scores add column analysis jsonb;
