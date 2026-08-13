"use client";

import { useActionState } from "react";
import { saveReligiousPracticeAction } from "@/actions/profile";

const madhhabs = [
  { value: "no_preference", label: "Peu importe" },
  { value: "hanafi", label: "Hanafite" },
  { value: "maliki", label: "Malikite" },
  { value: "shafii", label: "Chaféite" },
  { value: "hanbali", label: "Hanbalite" },
  { value: "other", label: "Autre" },
];

export function ReligiousPracticeForm() {
  const [state, formAction, pending] = useActionState(
    saveReligiousPracticeAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="madhhab" className="block text-sm font-medium text-primary-900">
          École juridique (madhhab)
        </label>
        <select
          id="madhhab"
          name="madhhab"
          defaultValue="no_preference"
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        >
          {madhhabs.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="religious_practice_level"
          className="block text-sm font-medium text-primary-900"
        >
          Ta pratique religieuse
        </label>
        <textarea
          id="religious_practice_level"
          name="religious_practice_level"
          rows={2}
          placeholder="Ex : 5 prières, jeûne du Ramadan, port du hijab..."
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-primary-900">
            Profession
          </label>
          <input
            id="profession"
            name="profession"
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div>
          <label htmlFor="height_cm" className="block text-sm font-medium text-primary-900">
            Taille (cm)
          </label>
          <input
            id="height_cm"
            name="height_cm"
            type="number"
            min={120}
            max={230}
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="education_level" className="block text-sm font-medium text-primary-900">
          Niveau d&apos;études
        </label>
        <input
          id="education_level"
          name="education_level"
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="has_children"
          name="has_children"
          type="checkbox"
          className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="has_children" className="text-sm text-primary-900">
          J&apos;ai déjà des enfants
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="wants_children"
          name="wants_children"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="wants_children" className="text-sm text-primary-900">
          Je souhaite avoir des enfants
        </label>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-primary-900">
          Présente-toi en quelques mots
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={1000}
          placeholder="Parle de tes valeurs, ce que tu recherches pour ton mariage..."
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="seeking_min_age" className="block text-sm font-medium text-primary-900">
            Âge recherché — min
          </label>
          <input
            id="seeking_min_age"
            name="seeking_min_age"
            type="number"
            min={18}
            max={100}
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div>
          <label htmlFor="seeking_max_age" className="block text-sm font-medium text-primary-900">
            Âge recherché — max
          </label>
          <input
            id="seeking_max_age"
            name="seeking_max_age"
            type="number"
            min={18}
            max={100}
            className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
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
