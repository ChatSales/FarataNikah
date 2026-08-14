"use client";

import { useActionState, useRef, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { changePasswordAction } from "@/actions/profile";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <section id="security" className="scroll-mt-20 rounded-2xl border border-primary-100 bg-cream-50 p-6">
      <h2 className="text-base font-semibold text-primary-900">Sécurité</h2>
      <p className="mt-0.5 text-xs text-primary-900/55">Mot de passe et vérification d&apos;identité</p>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-900">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            placeholder="8 caractères minimum"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-900">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {state && "error" in state && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="flex items-center gap-2 rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-primary-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Mot de passe mis à jour.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : "Mettre à jour"}
        </button>
      </form>
    </section>
  );
}
