"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import { respondToContactRequestAction } from "@/actions/contact-requests";

export function RespondRequestButtons({ requestId }: { requestId: string }) {
  const [state, formAction, pending] = useActionState(
    respondToContactRequestAction,
    null
  );

  if (state && "success" in state) {
    return <p className="text-sm font-medium text-primary-700">Réponse envoyée.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <form action={formAction}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="accept" value="true" />
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" /> Accepter
          </button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="requestId" value={requestId} />
          <input type="hidden" name="accept" value="false" />
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 rounded-full border border-primary-200 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-50 disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" /> Refuser
          </button>
        </form>
      </div>
      {state && "error" in state && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
    </div>
  );
}
