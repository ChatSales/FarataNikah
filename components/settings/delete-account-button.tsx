"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteAccountAction } from "@/actions/account";

export function DeleteAccountButton() {
  const [state, formAction, pending] = useActionState(deleteAccountAction, null);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 text-sm font-medium text-red-600 underline-offset-2 hover:underline"
      >
        <Trash2 className="h-4 w-4" /> Supprimer mon compte
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm text-primary-900/70">
        Cette action est définitive : ton profil, tes photos, tes conversations et ton
        abonnement seront supprimés sans possibilité de récupération. Pour confirmer, saisis{" "}
        <span className="font-semibold">SUPPRIMER</span> ci-dessous.
      </p>
      <input
        type="text"
        name="confirmation"
        autoComplete="off"
        placeholder="SUPPRIMER"
        className="w-full rounded-lg border border-red-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
      />
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Suppression en cours..." : "Supprimer définitivement"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm font-medium text-primary-900/60 hover:text-primary-900"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
