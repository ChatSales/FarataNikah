"use client";

import { useActionState, useState } from "react";
import { Send, Zap } from "lucide-react";
import { sendContactRequestAction } from "@/actions/contact-requests";
import { MessageFlashUpsell } from "@/components/discover/message-flash-upsell";
import { ContactLimitModal } from "@/components/discover/contact-limit-modal";

export function ContactRequestPanel({
  recipientProfileId,
  connectionStatus,
  isPremium,
}: {
  recipientProfileId: string;
  connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted";
  isPremium: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    sendContactRequestAction,
    null
  );
  const [flashMode, setFlashMode] = useState(false);

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

      {isPremium && flashMode && (
        <>
          <label
            htmlFor="message"
            className="flex items-center gap-1.5 text-sm font-medium text-primary-900"
          >
            <Zap className="h-4 w-4 text-gold-500" /> Ton message personnalisé
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            maxLength={500}
            placeholder="As-salamu alaykum, je serais heureux/heureuse d'échanger avec vous..."
            className="w-full rounded-lg border border-gold-300 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
          />
        </>
      )}

      {state && "error" in state && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {pending ? "Envoi..." : "Envoyer une demande de contact"}
        </button>

        {isPremium ? (
          !flashMode && (
            <button
              type="button"
              onClick={() => setFlashMode(true)}
              className="flex items-center justify-center gap-2 rounded-full border border-gold-400 bg-gold-400/10 px-4 py-3 text-sm font-semibold text-gold-600 transition hover:bg-gold-400/20"
            >
              <Zap className="h-4 w-4" />
              Message Flash
            </button>
          )
        ) : (
          <MessageFlashUpsell />
        )}
      </div>
      <ContactLimitModal signal={state && "limitReached" in state ? state : null} />
    </form>
  );
}
