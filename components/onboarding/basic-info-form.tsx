"use client";

import { useActionState } from "react";
import { saveBasicInfoAction } from "@/actions/profile";

const countries = [
  "Sénégal",
  "Mali",
  "Côte d'Ivoire",
  "Burkina Faso",
  "Guinée",
  "Niger",
  "Mauritanie",
  "Autre",
];

export function BasicInfoForm() {
  const [state, formAction, pending] = useActionState(saveBasicInfoAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-primary-900">
          Prénom
        </label>
        <input
          id="first_name"
          name="first_name"
          required
          minLength={2}
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-primary-900">Genre</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-primary-200 px-3.5 py-2.5 text-sm text-primary-900 has-checked:border-primary-600 has-checked:bg-primary-50">
            <input type="radio" name="gender" value="male" required className="sr-only" />
            Homme
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-primary-200 px-3.5 py-2.5 text-sm text-primary-900 has-checked:border-primary-600 has-checked:bg-primary-50">
            <input type="radio" name="gender" value="female" required className="sr-only" />
            Femme
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="date_of_birth" className="block text-sm font-medium text-primary-900">
          Date de naissance
        </label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          required
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        <p className="mt-1 text-xs text-primary-900/50">Tu dois avoir 18 ans ou plus.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-primary-900">
            Pays
          </label>
          <select
            id="country"
            name="country"
            required
            defaultValue=""
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="" disabled>
              Choisir
            </option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-primary-900">
            Ville
          </label>
          <input
            id="city"
            name="city"
            required
            minLength={2}
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="marital_status" className="block text-sm font-medium text-primary-900">
          Situation matrimoniale
        </label>
        <select
          id="marital_status"
          name="marital_status"
          required
          defaultValue="single"
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="single">Célibataire</option>
          <option value="divorced">Divorcé(e)</option>
          <option value="widowed">Veuf/Veuve</option>
        </select>
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
        {pending ? "Enregistrement..." : "Continuer"}
      </button>
    </form>
  );
}
