"use client";

import { useActionState } from "react";
import { savePrivacyAction } from "@/actions/profile";

export function PrivacyForm() {
  const [state, formAction, pending] = useActionState(savePrivacyAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <label className="flex items-start gap-3 rounded-xl border border-primary-100 p-4">
        <input
          id="blur_photos"
          name="blur_photos"
          type="checkbox"
          defaultChecked
          className="mt-0.5 h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
        />
        <span>
          <span className="block text-sm font-medium text-primary-900">
            Flouter mes photos
          </span>
          <span className="block text-xs text-primary-900/55">
            Tes photos restent floutées pour les autres membres tant que tu
            n&apos;as pas accepté une demande de contact.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-primary-100 p-4">
        <input
          id="is_anonymous"
          name="is_anonymous"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
        />
        <span>
          <span className="block text-sm font-medium text-primary-900">
            Mode anonyme
          </span>
          <span className="block text-xs text-primary-900/55">
            Ton prénom est masqué jusqu&apos;à ce que tu choisisses de te
            révéler à quelqu&apos;un.
          </span>
        </span>
      </label>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Terminer l'inscription"}
      </button>
    </form>
  );
}
