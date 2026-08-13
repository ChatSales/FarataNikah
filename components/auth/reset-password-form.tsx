"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/actions/auth";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, null);

  return (
    <form action={formAction} className="space-y-5">
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
        />
      </div>

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
        {pending ? "Enregistrement..." : "Mettre à jour le mot de passe"}
      </button>
    </form>
  );
}
