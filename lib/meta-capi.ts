import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const GRAPH_API_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaServerEventParams {
  eventName: string;
  // Shared with the matching client-side fbq() call (same logical
  // conversion) so Meta de-duplicates instead of double-counting.
  eventId?: string;
  eventSourceUrl?: string;
  email?: string;
  clientIp?: string;
  userAgent?: string;
  customData?: Record<string, unknown>;
}

// Server-side leg of Meta conversion tracking (Conversions API) — sent
// alongside the client-side Pixel event (components/analytics/meta-pixel*)
// for events where the browser-only version isn't trustworthy on its own,
// namely Purchase: the client fires as soon as the browser returns from
// Moneroo's checkout, before we know the payment actually succeeded, while
// this call runs from the webhook handler only once Moneroo confirms it.
export async function sendMetaServerEvent(params: MetaServerEventParams): Promise<void> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) return;

  const admin = createAdminClient();
  const { data: settings } = await admin
    .from("app_settings")
    .select("meta_pixel_id")
    .eq("id", true)
    .maybeSingle();
  const pixelId = settings?.meta_pixel_id;
  if (!pixelId) return;

  const userData: Record<string, unknown> = {};
  if (params.email) userData.em = [sha256(params.email)];
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.userAgent) userData.client_user_agent = params.userAgent;

  const body = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: params.customData,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      console.error("Meta Conversions API rejected the event:", await response.text());
    }
  } catch (error) {
    // Never let ad-tracking failures break the actual user-facing flow
    // (signup, payment confirmation) that triggered this call.
    console.error("Meta Conversions API call failed:", error);
  }
}
