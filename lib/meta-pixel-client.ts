"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    // eventID lets Meta de-duplicate against the matching server-side
    // Conversions API call for the same conversion (lib/meta-capi.ts).
    window.fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
  }
}
