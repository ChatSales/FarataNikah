import { AFRICAN_COUNTRIES } from "@/content/countries";
import type { Madhhab } from "@/lib/supabase/types";

const madhhabs: { value: Madhhab; label: string }[] = [
  { value: "no_preference", label: "Peu importe" },
  { value: "hanafi", label: "Hanafite" },
  { value: "maliki", label: "Malikite" },
  { value: "shafii", label: "Chaféite" },
  { value: "hanbali", label: "Hanbalite" },
  { value: "other", label: "Autre" },
];

export function FiltersBar({
  isPremium,
  defaultValues,
}: {
  isPremium: boolean;
  defaultValues: { country?: string; minAge?: string; maxAge?: string; madhhab?: string };
}) {
  return (
    <form className="flex flex-wrap items-end gap-4 rounded-2xl border border-primary-100 bg-cream-50 p-5">
      <div>
        <label htmlFor="country" className="block text-xs font-medium text-primary-900/70">
          Pays
        </label>
        <select
          id="country"
          name="country"
          defaultValue={defaultValues.country ?? ""}
          className="mt-1 rounded-lg border border-primary-200 bg-cream-50 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
        >
          <option value="">Tous les pays</option>
          {AFRICAN_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="minAge" className="block text-xs font-medium text-primary-900/70">
          Âge min
        </label>
        <input
          id="minAge"
          name="minAge"
          type="number"
          min={18}
          max={100}
          defaultValue={defaultValues.minAge}
          className="mt-1 w-20 rounded-lg border border-primary-200 bg-cream-50 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
        />
      </div>

      <div>
        <label htmlFor="maxAge" className="block text-xs font-medium text-primary-900/70">
          Âge max
        </label>
        <input
          id="maxAge"
          name="maxAge"
          type="number"
          min={18}
          max={100}
          defaultValue={defaultValues.maxAge}
          className="mt-1 w-20 rounded-lg border border-primary-200 bg-cream-50 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
        />
      </div>

      <div>
        <label htmlFor="madhhab" className="flex items-center gap-1.5 text-xs font-medium text-primary-900/70">
          Madhhab
          {!isPremium && (
            <span className="rounded-full bg-gold-400/30 px-1.5 py-0.5 text-[10px] font-semibold text-gold-600">
              Premium
            </span>
          )}
        </label>
        <select
          id="madhhab"
          name="madhhab"
          disabled={!isPremium}
          defaultValue={defaultValues.madhhab ?? ""}
          className="mt-1 rounded-lg border border-primary-200 bg-cream-50 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Tous</option>
          {madhhabs.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-cream-50 transition hover:bg-primary-700"
      >
        Filtrer
      </button>
    </form>
  );
}
