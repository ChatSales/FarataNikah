"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updatePrivacyAction } from "@/actions/profile";

export function PrivacyForm({
  defaults,
}: {
  defaults: { is_anonymous: boolean; blur_photos: boolean };
}) {
  const [state, formAction, pending] = useActionState(updatePrivacyAction, null);

  return (
    <section id="privacy" className="scroll-mt-20 rounded-2xl border border-primary-100 bg-cream-50 p-6">
      <h2 className="text-base font-semibold text-primary-900">Confidentialité</h2>
      <p className="mt-0.5 text-xs text-primary-900/55">Contrôle qui peut voir tes photos</p>

      <form action={formAction} className="mt-5 space-y-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="is_anonymous"
            defaultChecked={defaults.is_anonymous}
            className="mt-0.5 h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
          />
          <span>
            <span className="block text-sm font-medium text-primary-900">Profil anonyme</span>
            <span className="block text-xs text-primary-900/55">
              Ton prénom n&apos;est affiché qu&apos;aux membres avec qui tu es connecté(e).
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="blur_photos"
            defaultChecked={defaults.blur_photos}
            className="mt-0.5 h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
          />
          <span>
            <span className="block text-sm font-medium text-primary-900">Flouter mes photos</span>
            <span className="block text-xs text-primary-900/55">
              Tes photos restent floutées jusqu&apos;à ce que tu acceptes une demande de contact.
            </span>
          </span>
        </label>

        {state && "error" in state && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="flex items-center gap-2 rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-primary-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Préférences enregistrées.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </section>
  );
}
