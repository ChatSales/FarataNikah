"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <p className="text-sm text-primary-900/70">
        Indique ton email, on t&apos;envoie un lien pour réinitialiser ton mot
        de passe.
      </p>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          placeholder="toi@exemple.com"
        />
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p aria-live="polite" className="rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-primary-800">
          Si un compte existe avec cet email, un lien de réinitialisation a
          été envoyé.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Envoi..." : "Envoyer le lien"}
      </button>

      <p className="text-center text-sm text-primary-900/70">
        <Link href="/login" className="font-medium text-primary-700 underline">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
