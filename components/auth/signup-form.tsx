"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/actions/auth";
import { GoogleButton } from "@/components/auth/google-button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, null);

  return (
    <div className="space-y-5">
      <GoogleButton label="S'inscrire avec Google" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-primary-100" />
        <span className="text-xs text-primary-900/40">ou</span>
        <div className="h-px flex-1 bg-primary-100" />
      </div>

      <form action={formAction} className="space-y-5">
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-primary-900">
            Mot de passe
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

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <p className="text-center text-xs leading-relaxed text-primary-900/55">
          En t&apos;inscrivant, tu acceptes notre{" "}
          <Link href="/legal/reglement" className="underline">
            règlement
          </Link>{" "}
          et notre{" "}
          <Link href="/legal/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
        >
          {pending ? "Création du compte..." : "Créer mon compte"}
        </button>

        <p className="text-center text-sm text-primary-900/70">
          Déjà inscrit·e ?{" "}
          <Link href="/login" className="font-medium text-primary-700 underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
