import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { computeAiCompatibilityScore, type CompatibilityInput } from "@/lib/claude/compatibility";

// A cached score older than this is recomputed — profiles change (bio,
// pratique, critères), and 30 days keeps the Claude call volume bounded to
// "first time this pair is seen, then roughly monthly" rather than per view.
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Live-scoring every card on every page load would be too slow and too
// costly, so only the top-N heuristic matches get an AI score per visit —
// the rest keep the instant rules-based score until they're cached too.
export const AI_SCORE_CANDIDATE_LIMIT = 12;

export async function getAiCompatibilityScores(
  supabase: SupabaseClient<Database>,
  viewerProfileId: string,
  viewerInput: CompatibilityInput,
  candidates: { id: string; input: CompatibilityInput }[]
): Promise<Map<string, { score: number; reasoning: string }>> {
  const results = new Map<string, { score: number; reasoning: string }>();
  if (candidates.length === 0) return results;

  const candidateIds = candidates.map((c) => c.id);
  const { data: cached } = await supabase
    .from("compatibility_scores")
    .select("candidate_id, score, reasoning, computed_at")
    .eq("profile_id", viewerProfileId)
    .in("candidate_id", candidateIds);

  const freshCandidateIds = new Set<string>();
  for (const row of cached ?? []) {
    const age = Date.now() - new Date(row.computed_at).getTime();
    if (age < CACHE_MAX_AGE_MS) {
      results.set(row.candidate_id, { score: row.score, reasoning: row.reasoning ?? "" });
      freshCandidateIds.add(row.candidate_id);
    }
  }

  const toCompute = candidates.filter((c) => !freshCandidateIds.has(c.id));
  if (toCompute.length === 0) return results;

  const computed = await Promise.all(
    toCompute.map(async (c) => ({
      id: c.id,
      result: await computeAiCompatibilityScore(viewerInput, c.input),
    }))
  );

  const rowsToUpsert = computed
    .filter((c) => c.result !== null)
    .map((c) => ({
      profile_id: viewerProfileId,
      candidate_id: c.id,
      score: c.result!.score,
      reasoning: c.result!.reasoning,
      computed_at: new Date().toISOString(),
    }));

  for (const c of computed) {
    if (c.result) results.set(c.id, c.result);
  }

  if (rowsToUpsert.length > 0) {
    await supabase
      .from("compatibility_scores")
      .upsert(rowsToUpsert, { onConflict: "profile_id,candidate_id" });
  }

  return results;
}
