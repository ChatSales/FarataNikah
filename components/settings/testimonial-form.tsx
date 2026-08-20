"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitTestimonialAction } from "@/actions/testimonials";

export function TestimonialForm({ hasPendingSubmission }: { hasPendingSubmission: boolean }) {
  const [state, formAction, pending] = useActionState(submitTestimonialAction, null);

  const submitted = hasPendingSubmission || (state && "success" in state);

  if (submitted) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> Merci ! Ton témoignage est en cours de
        relecture par notre équipe avant publication.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="quote" className="block text-sm font-medium text-primary-900">
          Ton témoignage
        </label>
        <textarea
          id="quote"
          name="quote"
          rows={5}
          minLength={20}
          maxLength={600}
          placeholder="Raconte ton expérience sur FarataNikah — comment tu as trouvé la plateforme, ce qui t'a aidé(e), où tu en es aujourd'hui..."
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Envoi..." : "Envoyer mon témoignage"}
      </button>
      <p className="text-xs text-primary-900/50">
        Relu par notre équipe avant publication. Ton prénom et ta ville pourront être affichés
        (ou &quot;Membre FarataNikah&quot; si ton profil est en mode anonyme).
      </p>
    </form>
  );
}
