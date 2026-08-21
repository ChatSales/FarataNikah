"use client";

import { useActionState, useState } from "react";
import { saveMetaSettingsAction } from "@/actions/admin";

export function MetaPixelForm({
  currentPixelId,
  hasAccessToken,
  currentTestEventCode,
}: {
  currentPixelId: string | null;
  hasAccessToken: boolean;
  currentTestEventCode: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveMetaSettingsAction, null);
  const [clearToken, setClearToken] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="metaPixelId" className="block text-sm font-medium text-primary-900">
          Identifiant du Pixel Meta
        </label>
        <input
          id="metaPixelId"
          name="metaPixelId"
          type="text"
          inputMode="numeric"
          defaultValue={currentPixelId ?? ""}
          placeholder="Ex : 1234567890123456"
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        <p className="mt-1.5 text-xs text-primary-900/50">
          Disponible dans Meta Events Manager → Sources de données → ton pixel. Laisse vide
          pour désactiver le suivi.
        </p>
      </div>

      <div>
        <label htmlFor="metaAccessToken" className="block text-sm font-medium text-primary-900">
          Token d&apos;accès Conversions API
        </label>
        <input
          id="metaAccessToken"
          name="metaAccessToken"
          type="password"
          autoComplete="off"
          disabled={clearToken}
          placeholder={hasAccessToken ? "•••••••••••••••••••• (déjà enregistré)" : "Colle ton token ici"}
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
        />
        <p className="mt-1.5 text-xs text-primary-900/50">
          Disponible dans Meta Events Manager → Sources de données → ton pixel → Paramètres →
          Conversions API. Permet d&apos;envoyer les événements de conversion (inscription,
          achat Premium) directement depuis le serveur, de façon plus fiable que le pixel
          seul — notamment un achat Premium n&apos;est confirmé qu&apos;une fois le paiement
          réellement validé. Laisse vide pour ne pas changer le token déjà enregistré.
        </p>
        {hasAccessToken && (
          <label className="mt-2 flex items-center gap-2 text-xs text-primary-900/60">
            <input
              type="checkbox"
              name="clearMetaAccessToken"
              checked={clearToken}
              onChange={(e) => setClearToken(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-primary-300 text-red-600 focus:ring-red-500/40"
            />
            Retirer le token enregistré
          </label>
        )}
      </div>

      <div>
        <label htmlFor="metaTestEventCode" className="block text-sm font-medium text-primary-900">
          Code de test (optionnel)
        </label>
        <input
          id="metaTestEventCode"
          name="metaTestEventCode"
          type="text"
          defaultValue={currentTestEventCode ?? ""}
          placeholder="Ex : TEST12345"
          className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        <p className="mt-1.5 text-xs text-primary-900/50">
          Colle ici le code affiché dans Meta Events Manager → Tester les événements
          pour voir les événements serveur arriver en direct pendant que tu vérifies
          la config. Retire-le une fois la vérification faite — sinon les vrais
          événements ne remontent plus que dans cet onglet de test.
        </p>
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="rounded-lg bg-primary-50 px-3.5 py-2.5 text-sm text-primary-800">
          Enregistré.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
