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

// A small, pre-verified set of references about marriage in Islam — Claude
// picks and explains the most relevant one rather than generating a
// citation from scratch, since an LLM asked to produce a fresh Quran/Hadith
// reference per profile pair risks fabricating verse numbers or hadith
// attributions. Wording kept close to well-known translations.
const ISLAMIC_REFERENCES = [
  {
    id: "ar-rum-21",
    text: "Et parmi Ses signes, Il a créé pour vous, à partir de vous-mêmes, des épouses pour que vous viviez en tranquillité avec elles ; et Il a mis entre vous de l'affection et de la bonté.",
    source: "Sourate Ar-Rûm, 30:21",
  },
  {
    id: "baqara-187",
    text: "Elles sont un vêtement pour vous et vous êtes un vêtement pour elles.",
    source: "Sourate Al-Baqara, 2:187",
  },
  {
    id: "nisa-1",
    text: "Ô hommes ! Craignez votre Seigneur qui vous a créés d'un seul être, et de celui-ci a créé son épouse, et de ces deux a fait répandre beaucoup d'hommes et de femmes.",
    source: "Sourate An-Nisa, 4:1",
  },
  {
    id: "tirmidhi-din-khuluq",
    text: "Si quelqu'un dont vous appréciez la religion et le caractère vous demande en mariage, mariez-le.",
    source: "Rapporté par At-Tirmidhi",
  },
  {
    id: "tirmidhi-khayrukum",
    text: "Le meilleur d'entre vous est celui qui est le meilleur envers sa famille.",
    source: "Rapporté par At-Tirmidhi",
  },
] as const;

// Upper bounds kept loose — Claude doesn't always respect a tight max()
// via the structured-output schema, and zodOutputFormat's parse() throws
// on any validation miss rather than truncating. Excess items are sliced
// off for display instead of risking the whole call failing validation.
const AnalysisSchema = z.object({
  score: z.number().int().min(0).max(100),
  commonValues: z.array(z.string()).min(2).max(8),
  referenceId: z.enum(
    ISLAMIC_REFERENCES.map((r) => r.id) as [string, ...string[]]
  ),
  referenceRelevance: z.string(),
  suggestedQuestions: z.array(z.string()).min(2).max(8),
  advice: z.array(z.string()).min(2).max(8),
  discussionPoints: z.array(z.string()).min(2).max(8),
});

export interface CompatibilityAnalysis {
  score: number;
  commonValues: string[];
  reference: { text: string; source: string };
  referenceRelevance: string;
  suggestedQuestions: string[];
  advice: string[];
  discussionPoints: string[];
}

const ANALYSIS_SYSTEM_PROMPT = `Tu es une assistante spécialisée en préparation au mariage islamique sur FarataNikah, une plateforme de mariage halal pour musulmans sérieux en Afrique. On te donne deux profils ; produis une analyse de compatibilité approfondie pour aider ces deux personnes à préparer une éventuelle conversation de mariage.

Références disponibles (choisis l'identifiant le plus pertinent, n'en invente aucune autre) :
${ISLAMIC_REFERENCES.map((r) => `- ${r.id} : "${r.text}" (${r.source})`).join("\n")}

Consignes :
- "commonValues" : 3 à 5 valeurs ou points communs concrets entre les deux profils (pratique religieuse, projet de vie, éducation des enfants, etc.), pas de généralités vagues.
- "referenceId" : l'identifiant d'UNE SEULE référence de la liste ci-dessus, la plus pertinente pour ce couple.
- "referenceRelevance" : une phrase expliquant en quoi cette référence éclaire leur compatibilité — sans réinterpréter le texte religieux, juste le relier à leur situation.
- "suggestedQuestions" : 3 à 4 questions concrètes que ces deux personnes pourraient se poser pour avancer sérieusement.
- "advice" : 2 à 3 conseils pratiques de préparation au mariage adaptés à leur profil (wali, communication avec la famille, attentes mutuelles).
- "discussionPoints" : 2 à 3 sujets qu'il serait utile qu'ils abordent ensemble avant d'aller plus loin.
Reste factuelle, bienveillante, orientée mariage — jamais familière ni dans le registre de la rencontre.`;

export async function computeCompatibilityAnalysis(
  viewer: CompatibilityInput,
  candidate: CompatibilityInput
): Promise<CompatibilityAnalysis | null> {
  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Profil A (la personne qui consulte) :\n${JSON.stringify(viewer)}\n\nProfil B (le profil consulté) :\n${JSON.stringify(candidate)}`,
        },
      ],
      output_config: {
        format: zodOutputFormat(AnalysisSchema),
      },
    });

    const parsed = response.parsed_output;
    if (!parsed) return null;

    const reference = ISLAMIC_REFERENCES.find((r) => r.id === parsed.referenceId);
    if (!reference) return null;

    return {
      score: parsed.score,
      commonValues: parsed.commonValues.slice(0, 5),
      reference: { text: reference.text, source: reference.source },
      referenceRelevance: parsed.referenceRelevance,
      suggestedQuestions: parsed.suggestedQuestions.slice(0, 4),
      advice: parsed.advice.slice(0, 3),
      discussionPoints: parsed.discussionPoints.slice(0, 3),
    };
  } catch (error) {
    console.error("AI compatibility analysis failed:", error);
    return null;
  }
}
