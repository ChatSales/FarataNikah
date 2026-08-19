"use client";

import { useActionState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { updatePricingPlanAction } from "@/actions/admin";
import type { Database } from "@/lib/supabase/types";

type PricingPlanRow = Database["public"]["Tables"]["pricing_plans"]["Row"];

export function PricingPlanForm({
  plan,
  showPopularToggle,
}: {
  plan: PricingPlanRow;
  showPopularToggle: boolean;
}) {
  const [state, formAction, pending] = useActionState(updatePricingPlanAction, null);

  const durationLabel = plan.duration_days
    ? `${plan.duration_days} jours`
    : plan.duration_hours
      ? plan.duration_hours % 24 === 0
        ? `${plan.duration_hours / 24} jours`
        : `${plan.duration_hours}h`
      : null;

  return (
    <form
      action={formAction}
      className={`rounded-2xl border p-5 transition hover:shadow-sm ${
        plan.is_active ? "border-primary-100 bg-cream-50" : "border-primary-100 bg-primary-50/40"
      }`}
    >
      <input type="hidden" name="id" value={plan.id} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-primary-900">{plan.label}</p>
          <p className="mt-0.5 text-xs text-primary-900/50">
            {[
              durationLabel,
              plan.boosts_included > 0
                ? `+${plan.boosts_included} boost${plan.boosts_included > 1 ? "s" : ""}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {plan.is_popular && (
          <span className="shrink-0 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-900">
            Populaire
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`price-${plan.id}`}
            className="block text-xs font-medium text-primary-900/70"
          >
            Prix (FCFA)
          </label>
          <input
            id={`price-${plan.id}`}
            name="price_fcfa"
            type="number"
            min={0}
            defaultValue={plan.price_fcfa}
            className="mt-1 w-full rounded-lg border border-primary-200 bg-cream-50 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        {plan.type === "premium" && (
          <div>
            <label
              htmlFor={`original-${plan.id}`}
              className="block text-xs font-medium text-primary-900/70"
            >
              Prix barré (FCFA)
            </label>
            <input
              id={`original-${plan.id}`}
              name="original_price_fcfa"
              type="number"
              min={0}
              defaultValue={plan.original_price_fcfa ?? ""}
              className="mt-1 w-full rounded-lg border border-primary-200 bg-cream-50 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-primary-900">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={plan.is_active}
            className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
          />
          Active
        </label>
        {showPopularToggle && (
          <label className="flex items-center gap-2 text-sm text-primary-900">
            <input
              type="checkbox"
              name="is_popular"
              defaultChecked={plan.is_popular}
              className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
            />
            Mise en avant
          </label>
        )}
      </div>

      {state && "error" in state && (
        <p className="mt-3 text-xs text-red-600">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Enregistré
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-xs font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
