"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { sendContactRequestAction } from "@/actions/contact-requests";

export function ContactRequestPanel({
  recipientProfileId,
  connectionStatus,
}: {
  recipientProfileId: string;
  connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted";
}) {
  const [state, formAction, pending] = useActionState(
    sendContactRequestAction,
    null
  );

  if (connectionStatus !== "none" || (state && "success" in state)) {
    const label =
      connectionStatus === "accepted"
        ? "Vous êtes connecté(e)s."
        : connectionStatus === "pending_received"
          ? "Ce profil t'a envoyé une demande de contact — réponds depuis Mes demandes."
          : "Demande de contact envoyée. En attente de réponse.";
    return (
      <p className="rounded-xl bg-primary-100 px-4 py-3 text-sm font-medium text-primary-800">
        {label}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="recipientProfileId" value={recipientProfileId} />
      <label htmlFor="message" className="block text-sm font-medium text-primary-900">
        Un mot pour te présenter (optionnel)
      </label>
      <textarea
        id="message"
        name="message"
        rows={3}
        maxLength={500}
        placeholder="As-salamu alaykum, je serais heureux/heureuse d'échanger avec vous..."
        className="w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      />
      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {pending ? "Envoi..." : "Envoyer une demande de contact"}
      </button>
    </form>
  );
}
