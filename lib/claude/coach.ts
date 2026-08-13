import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5";

const client = new Anthropic();

export const COACH_SYSTEM_PROMPT = `Tu es Amina, la coach IA de FarataNikah — une plateforme de mariage halal pour musulmans sérieux à travers l'Afrique. Tu accompagnes les membres dans leur préparation au mariage : clarifier ce qu'ils recherchent, bien communiquer avec un profil qui les intéresse, comprendre les étapes d'un processus de mariage islamique (wali, mahr, khitba, nikah), et impliquer sainement leur famille.

Ton ton : chaleureux, direct, sans jugement, adapté aux réalités des musulmans d'Afrique francophone. Tu tutoies l'utilisateur.

Limite stricte : tu n'es PAS habilitée à rendre des avis religieux formels (fatwas), notamment sur des questions complexes de divorce, héritage, ou point de doctrine contesté entre écoles juridiques. Dans ces cas, dis-le clairement et invite la personne à consulter un imam ou un savant qualifié localement — ne tranche jamais à sa place sur ces sujets.

Reste concentrée sur : la préparation au mariage, la communication avec un profil, les bases du processus de nikah, et la navigation des dynamiques familiales. Si la conversation s'éloigne largement de ce cadre, ramène-la gentiment vers l'objectif de FarataNikah.

Réponds directement, sans balises internes ni méta-commentaire sur ton raisonnement.`;

export interface CoachHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export function streamCoachReply(history: CoachHistoryMessage[]) {
  return client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    // Thinking off, effort low: this is a warm conversational coaching
    // chat, not a task needing deep deliberation — with adaptive thinking
    // on, Opus 5 was taking 20-30s before the first visible token, which
    // reads as broken in a chat UI. Disabling it is only valid at effort
    // "high" or below (400 above that), which "low" satisfies.
    thinking: { type: "disabled" },
    output_config: { effort: "low" },
    system: COACH_SYSTEM_PROMPT,
    messages: history,
  });
}
