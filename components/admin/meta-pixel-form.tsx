"use client";

import { useActionState } from "react";
import { saveMetaPixelIdAction } from "@/actions/admin";

export function MetaPixelForm({ currentPixelId }: { currentPixelId: string | null }) {
  const [state, formAction, pending] = useActionState(saveMetaPixelIdAction, null);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="metaPixelId" className="block text-sm font-medium text-primary-900">
          Identifiant du Pixel Meta
        </label>
        <input
          id="metaPixelId"
          name="metaPixelId"
          type="text"
          inputMode="numeric"
          defaultValue={currentPixelId ?? ""}
          placeholder="Ex : 1234567890123456"
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        <p className="mt-1.5 text-xs text-primary-900/50">
          Disponible dans Meta Events Manager → Sources de données → ton pixel. Laisse vide
          pour désactiver le suivi.
        </p>
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-primary-800">
          Enregistré.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
