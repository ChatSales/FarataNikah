import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

// Haiku 4.5: bounded scoring task, same reasoning as message moderation —
// this runs synchronously while a member browses Discover, so latency
// matters more than the extra nuance Opus would bring.
const MODEL = "claude-haiku-4-5";

const client = new Anthropic();

const CompatibilitySchema = z.object({
  score: z.number().int().min(0).max(100),
  reasoning: z.string(),
});

export interface CompatibilityInput {
  age: number;
  city: string;
  country: string;
  madhhab: string;
  maritalStatus: string;
  practiceLevel: string | null;
  profession: string | null;
  educationLevel: string | null;
  bio: string | null;
  seekingMinAge: number | null;
  seekingMaxAge: number | null;
}

export interface CompatibilityResult {
  score: number;
  reasoning: string;
}

const SYSTEM_PROMPT = `Tu évalues la compatibilité entre deux profils de FarataNikah, une plateforme de mariage halal pour musulmans sérieux en Afrique. Les deux personnes cherchent un mariage conforme aux principes de l'islam.

Donne un score de compatibilité de 0 à 100 en te basant sur : la cohérence des critères d'âge recherchés (dans les deux sens), la proximité géographique, la compatibilité du madhhab (l'absence de préférence chez l'un des deux compte comme compatible), l'alignement du niveau de pratique religieuse, et la cohérence globale du profil (profession, études, présentation) pour un projet de mariage sérieux. Ne pénalise pas l'absence d'information sur un critère — évalue avec ce qui est disponible. Donne une phrase courte expliquant le score, orientée mariage (pas rencontre).`;

export async function computeAiCompatibilityScore(
  viewer: CompatibilityInput,
  candidate: CompatibilityInput
): Promise<CompatibilityResult | null> {
  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Profil A (la personne qui consulte) :\n${JSON.stringify(viewer)}\n\nProfil B (le profil consulté) :\n${JSON.stringify(candidate)}`,
        },
      ],
      output_config: {
        format: zodOutputFormat(CompatibilitySchema),
      },
    });

    const parsed = response.parsed_output;
    if (!parsed) return null;

    return { score: parsed.score, reasoning: parsed.reasoning };
  } catch (error) {
    // Fail open to the rules-based heuristic — an AI scoring outage
    // shouldn't block Discover from rendering.
    console.error("AI compatibility scoring failed:", error);
    return null;
  }
}
