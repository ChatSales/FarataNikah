import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamCoachReply, type CoachHistoryMessage } from "@/lib/claude/coach";
import { FREE_DAILY_COACH_QUESTIONS } from "@/lib/usage-limits";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const content = typeof body?.message === "string" ? body.message.trim() : "";
  if (!content) return new Response("Message vide.", { status: 400 });
  if (content.length > 2000) return new Response("Message trop long.", { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Non authentifié.", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_premium, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile || profile.verification_status !== "approved") {
    return new Response("Profil non approuvé.", { status: 403 });
  }

  if (!profile.is_premium) {
    const { data: allowed, error: counterError } = await supabase.rpc(
      "increment_and_check_counter",
      {
        p_profile_id: profile.id,
        p_column: "coach_questions_asked",
        p_limit: FREE_DAILY_COACH_QUESTIONS,
      }
    );
    if (counterError) return new Response("Erreur serveur.", { status: 500 });
    if (!allowed) {
      return new Response(
        `Limite quotidienne atteinte (${FREE_DAILY_COACH_QUESTIONS} questions/jour en gratuit). Passe Premium pour un accès illimité à Coach Amina.`,
        { status: 429 }
      );
    }
  }

  let { data: conversation } = await supabase
    .from("coach_conversations")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!conversation) {
    const { data: created, error: createError } = await supabase
      .from("coach_conversations")
      .insert({ profile_id: profile.id })
      .select("id")
      .single();
    if (createError || !created) return new Response("Erreur serveur.", { status: 500 });
    conversation = created;
  }
  const conversationId = conversation.id;

  const { data: pastMessages } = await supabase
    .from("coach_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  const history: CoachHistoryMessage[] = [
    ...(pastMessages ?? []),
    { role: "user", content },
  ];

  await supabase.from("coach_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        const claudeStream = streamCoachReply(history);
        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("Coach stream error:", err);
      } finally {
        if (full) {
          await supabase.from("coach_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: full,
          });
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
