import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { ModerationFlagType, ModerationSeverity } from "@/lib/supabase/types";

// Haiku 4.5: well-bounded classification task on the latency-sensitive
// message-send path — an intentional exception to defaulting to Opus.
const MODEL = "claude-haiku-4-5";

const client = new Anthropic();

const ModerationSchema = z.object({
  is_flagged: z.boolean(),
  category: z
    .enum([
      "inappropriate_content",
      "contact_info_exchange",
      "harassment",
      "spam",
      "other",
    ])
    .nullable(),
  severity: z.enum(["low", "medium", "high"]).nullable(),
  reasoning: z.string(),
});

export interface ModerationResult {
  flagged: boolean;
  category: ModerationFlagType | null;
  severity: ModerationSeverity | null;
  reasoning: string;
}

const SYSTEM_PROMPT = `Tu modères les messages échangés sur Farata, une plateforme de mariage halal pour musulmans sérieux en Afrique. Les utilisateurs échangent uniquement après acceptation mutuelle d'une demande de contact, en vue du mariage.

Signale un message si, et seulement si, il contient :
- une tentative d'échanger des coordonnées externes (numéro de téléphone, WhatsApp, Instagram, email) AVANT que la relation soit suffisamment établie — étape normale d'une conversation de mariage sérieuse une fois la confiance installée, donc ne signale que les tentatives précoces ou insistantes
- un contenu explicite, dragueur ou irrespectueux, incompatible avec une recherche de mariage
- du harcèlement, de la pression ou de l'insistance après un refus
- du spam ou une arnaque manifeste (demande d'argent, lien suspect)

Ne signale PAS les conversations normales de planification de mariage : parler de rencontrer la famille, discuter de villes, de dates, de valeurs religieuses, de projets de vie. En cas de doute, ne signale pas — le seuil est haut, et un faux positif bloque une conversation légitime entre deux personnes qui essaient de se marier.`;

export async function moderateMessage(
  content: string
): Promise<ModerationResult> {
  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
      output_config: {
        format: zodOutputFormat(ModerationSchema),
      },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      throw new Error("Claude n'a pas retourné de résultat structuré.");
    }

    return {
      flagged: parsed.is_flagged,
      category: parsed.category,
      severity: parsed.severity,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    // Fail open: a transient API/network error shouldn't block real users
    // from messaging. Soft-flag-and-log is the MVP default per the M3
    // moderation design — hard blocks are reserved for confirmed high-
    // severity matches, not for moderation-pipeline outages.
    console.error("Message moderation failed, approving by default:", error);
    return { flagged: false, category: null, severity: null, reasoning: "" };
  }
}
