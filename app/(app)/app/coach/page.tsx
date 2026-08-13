import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CoachChat } from "@/components/coach/coach-chat";

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_premium")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  const { data: conversation } = await supabase
    .from("coach_conversations")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: pastMessages } = conversation
    ? await supabase
        .from("coach_messages")
        .select("role, content")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(20)
    : { data: [] };

  return (
    <CoachChat
      initialMessages={pastMessages ?? []}
      isPremium={profile.is_premium}
    />
  );
}
