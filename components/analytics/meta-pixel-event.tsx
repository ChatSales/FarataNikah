"use client";

import { useEffect, useRef } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel-client";

export function MetaPixelEvent({
  event,
  params,
  eventId,
}: {
  event: string;
  params?: Record<string, unknown>;
  eventId?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackMetaEvent(event, params, eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
