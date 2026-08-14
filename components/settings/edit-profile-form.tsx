"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateProfileDetailsAction } from "@/actions/profile";
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

const inputClass =
  "mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";
const labelClass = "block text-sm font-medium text-primary-900";

export interface EditProfileDefaults {
  first_name: string;
  date_of_birth: string;
  marital_status: "single" | "divorced" | "widowed";
  country: string;
  city: string;
  nationality: string | null;
  madhhab: Madhhab;
  religious_practice_level: string | null;
  has_children: boolean;
  wants_children: boolean | null;
  profession: string | null;
  education_level: string | null;
  height_cm: number | null;
  bio: string | null;
  interests: string | null;
  life_goals: string | null;
  seeking_min_age: number | null;
  seeking_max_age: number | null;
}

function SectionCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 rounded-2xl border border-primary-100 bg-cream-50 p-6"
    >
      <h2 className="text-base font-semibold text-primary-900">{title}</h2>
      <p className="mt-0.5 text-xs text-primary-900/55">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function EditProfileForm({ defaults }: { defaults: EditProfileDefaults }) {
  const [state, formAction, pending] = useActionState(updateProfileDetailsAction, null);

  return (
    <form action={formAction} className="space-y-6">
      <SectionCard
        id="personal"
        title="Informations personnelles"
        description="Prénom, âge, situation matrimoniale"
      >
        <div>
          <label htmlFor="first_name" className={labelClass}>
            Prénom
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            minLength={2}
            defaultValue={defaults.first_name}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date_of_birth" className={labelClass}>
              Date de naissance
            </label>
            <input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              required
              defaultValue={defaults.date_of_birth}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="marital_status" className={labelClass}>
              Situation matrimoniale
            </label>
            <select
              id="marital_status"
              name="marital_status"
              defaultValue={defaults.marital_status}
              className={inputClass}
            >
              <option value="single">Célibataire</option>
              <option value="divorced">Divorcé(e)</option>
              <option value="widowed">Veuf/Veuve</option>
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="location"
        title="Localisation & Profession"
        description="Où tu vis et ce que tu fais"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className={labelClass}>
              Pays
            </label>
            <select id="country" name="country" defaultValue={defaults.country} className={inputClass}>
              {AFRICAN_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="city" className={labelClass}>
              Ville
            </label>
            <input
              id="city"
              name="city"
              required
              minLength={2}
              defaultValue={defaults.city}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="nationality" className={labelClass}>
            Nationalité
          </label>
          <input
            id="nationality"
            name="nationality"
            defaultValue={defaults.nationality ?? ""}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="profession" className={labelClass}>
              Profession
            </label>
            <input
              id="profession"
              name="profession"
              defaultValue={defaults.profession ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="height_cm" className={labelClass}>
              Taille (cm)
            </label>
            <input
              id="height_cm"
              name="height_cm"
              type="number"
              min={120}
              max={230}
              defaultValue={defaults.height_cm ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="education_level" className={labelClass}>
            Niveau d&apos;études
          </label>
          <input
            id="education_level"
            name="education_level"
            defaultValue={defaults.education_level ?? ""}
            className={inputClass}
          />
        </div>
      </SectionCard>

      <SectionCard
        id="vision"
        title="Vision du mariage"
        description="Ce que tu recherches dans le mariage"
      >
        <div>
          <label htmlFor="bio" className={labelClass}>
            Présente-toi en quelques mots
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={1000}
            defaultValue={defaults.bio ?? ""}
            placeholder="Parle de tes valeurs, ce que tu recherches pour ton mariage..."
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="seeking_min_age" className={labelClass}>
              Âge recherché — min
            </label>
            <input
              id="seeking_min_age"
              name="seeking_min_age"
              type="number"
              min={18}
              max={100}
              defaultValue={defaults.seeking_min_age ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="seeking_max_age" className={labelClass}>
              Âge recherché — max
            </label>
            <input
              id="seeking_max_age"
              name="seeking_max_age"
              type="number"
              min={18}
              max={100}
              defaultValue={defaults.seeking_max_age ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            id="has_children"
            name="has_children"
            type="checkbox"
            defaultChecked={defaults.has_children}
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
            defaultChecked={defaults.wants_children ?? true}
            className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="wants_children" className="text-sm text-primary-900">
            Je souhaite avoir des enfants
          </label>
        </div>
      </SectionCard>

      <SectionCard
        id="personality"
        title="Personnalité"
        description="Tes centres d'intérêt et traits de caractère"
      >
        <div>
          <label htmlFor="interests" className={labelClass}>
            Centres d&apos;intérêt et traits de caractère
          </label>
          <textarea
            id="interests"
            name="interests"
            rows={3}
            maxLength={500}
            defaultValue={defaults.interests ?? ""}
            placeholder="Ex : lecture, cuisine, calme et patient(e), sport le week-end..."
            className={inputClass}
          />
        </div>
      </SectionCard>

      <SectionCard
        id="religious"
        title="Pratique religieuse"
        description="Ta pratique et tes connaissances"
      >
        <div>
          <label htmlFor="madhhab" className={labelClass}>
            École juridique (madhhab)
          </label>
          <select id="madhhab" name="madhhab" defaultValue={defaults.madhhab} className={inputClass}>
            {madhhabs.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="religious_practice_level" className={labelClass}>
            Ta pratique religieuse
          </label>
          <textarea
            id="religious_practice_level"
            name="religious_practice_level"
            rows={2}
            defaultValue={defaults.religious_practice_level ?? ""}
            placeholder="Ex : 5 prières, jeûne du Ramadan, port du hijab..."
            className={inputClass}
          />
        </div>
      </SectionCard>

      <SectionCard id="lifeplans" title="Projet de vie" description="Tes projets et aspirations">
        <div>
          <label htmlFor="life_goals" className={labelClass}>
            Tes projets et aspirations
          </label>
          <textarea
            id="life_goals"
            name="life_goals"
            rows={3}
            maxLength={500}
            defaultValue={defaults.life_goals ?? ""}
            placeholder="Ex : s'installer ensemble, projets professionnels, où tu te vois dans 5 ans..."
            className={inputClass}
          />
        </div>
      </SectionCard>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="flex items-center gap-2 rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-primary-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Profil mis à jour.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
