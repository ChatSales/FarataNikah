"use client";

import { Check, X } from "lucide-react";
import {
  confirmModerationFlagAction,
  dismissModerationFlagAction,
} from "@/actions/admin";

export function ModerationFlagActions({ flagId }: { flagId: string }) {
  return (
    <div className="flex gap-2">
      <form action={confirmModerationFlagAction}>
        <input type="hidden" name="flagId" value={flagId} />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
        >
          <Check className="h-3.5 w-3.5" /> Confirmer le signalement
        </button>
      </form>
      <form action={dismissModerationFlagAction}>
        <input type="hidden" name="flagId" value={flagId} />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full border border-primary-200 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-50"
        >
          <X className="h-3.5 w-3.5" /> Ignorer
        </button>
      </form>
    </div>
  );
}
