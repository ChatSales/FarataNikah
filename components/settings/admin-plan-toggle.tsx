"use client";

import { useActionState } from "react";
import { FlaskConical } from "lucide-react";
import { toggleOwnPremiumAction } from "@/actions/admin";

export function AdminPlanToggle({ isPremium }: { isPremium: boolean }) {
  const [state, formAction, pending] = useActionState(toggleOwnPremiumAction, null);

  return (
    <section className="mt-6 rounded-2xl border border-dashed border-primary-300 bg-primary-50/40 p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
        <FlaskConical className="h-4 w-4" /> Mode test (admin)
      </h2>
      <p className="mt-2 text-sm text-primary-900/70">
        Bascule ton propre compte entre Gratuit et Premium sans passer par Moneroo, pour
        voir comment chaque plan se comporte. Réservé aux administrateurs.
      </p>
      {state && "error" in state && (
        <p className="mt-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <form action={formAction} className="mt-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-primary-300 bg-cream-50 px-5 py-2.5 text-sm font-semibold text-primary-800 transition hover:bg-primary-100 disabled:opacity-60"
        >
          {pending
            ? "..."
            : isPremium
              ? "Repasser en Gratuit"
              : "Passer en Premium (test)"}
        </button>
      </form>
    </section>
  );
}
