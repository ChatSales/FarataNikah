import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function hasAcceptedConnection(
  supabase: SupabaseServerClient,
  profileIdA: string,
  profileIdB: string
): Promise<boolean> {
  const { count } = await supabase
    .from("contact_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(
      `and(sender_profile_id.eq.${profileIdA},recipient_profile_id.eq.${profileIdB}),and(sender_profile_id.eq.${profileIdB},recipient_profile_id.eq.${profileIdA})`
    );

  return (count ?? 0) > 0;
}

// Returns a signed URL for the target profile's primary photo, or null if
// the photo should stay hidden (blur_photos on and no accepted connection
// yet). Gating happens server-side before a URL is ever minted, rather
// than sending the real image and blurring it with CSS — a CSS blur can
// be inspected/removed client-side and would leak the photo anyway.
export async function getGatedPrimaryPhotoUrl(
  supabase: SupabaseServerClient,
  viewerProfileId: string,
  target: { id: string; blur_photos: boolean }
): Promise<string | null> {
  if (target.blur_photos && viewerProfileId !== target.id) {
    const connected = await hasAcceptedConnection(
      supabase,
      viewerProfileId,
      target.id
    );
    if (!connected) return null;
  }

  const { data: photo } = await supabase
    .from("profile_photos")
    .select("storage_path")
    .eq("profile_id", target.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (!photo) return null;

  const { data: signed } = await supabase.storage
    .from("profile-photos")
    .createSignedUrl(photo.storage_path, 60 * 30);

  return signed?.signedUrl ?? null;
}
