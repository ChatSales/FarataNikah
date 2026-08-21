"use client";

import { useActionState, useRef, useState } from "react";
import { MoreVertical, Ban, Flag, X, Loader2 } from "lucide-react";
import { blockProfileAction, reportProfileAction } from "@/actions/blocking";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

const reportReasons: { value: string; label: string }[] = [
  { value: "fake_profile", label: "Faux profil / usurpation" },
  { value: "inappropriate_content", label: "Contenu inapproprié" },
  { value: "harassment", label: "Harcèlement" },
  { value: "already_married_hidden", label: "Situation matrimoniale cachée" },
  { value: "scam", label: "Arnaque / démarchage" },
  { value: "other", label: "Autre" },
];

export function BlockReportMenu({ profileId }: { profileId: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  // A successful block redirects away from this page entirely (see
  // blockProfileAction) — no in-place success state to render here.
  const [blockState, blockAction, blockPending] = useActionState(blockProfileAction, null);
  const [reportState, reportAction, reportPending] = useActionState(reportProfileAction, null);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Plus d'options"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {menuOpen && (
        <div className="animate-dropdown absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-xl border border-primary-100 bg-cream-50 shadow-lg">
          <form
            action={blockAction}
            onSubmit={() => setMenuOpen(false)}
          >
            <input type="hidden" name="profileId" value={profileId} />
            <button
              type="submit"
              disabled={blockPending}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-primary-900 transition hover:bg-primary-50 disabled:opacity-60"
            >
              {blockPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              {blockPending ? "Blocage..." : "Bloquer"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setReportOpen(true);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <Flag className="h-4 w-4" /> Signaler
          </button>
        </div>
      )}

      {blockState && "error" in blockState && (
        <p className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs text-red-600 shadow-lg">
          {blockState.error}
        </p>
      )}

      {reportOpen && (
        <div className="animate-fade-up fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 px-4" style={{ animationDuration: "0.2s" }}>
          <div className="animate-scale-in relative w-full max-w-sm rounded-2xl bg-cream-50 p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-primary-900/40 hover:text-primary-900"
            >
              <X className="h-5 w-5" />
            </button>

            {reportState && "success" in reportState ? (
              <div className="py-4 text-center">
                <p className="text-sm font-medium text-primary-900">
                  Signalement envoyé. Notre équipe va l&apos;examiner.
                </p>
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="mt-4 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-cream-50 hover:bg-primary-700"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form action={reportAction} className="space-y-4">
                <input type="hidden" name="profileId" value={profileId} />
                <h2 className="text-lg font-semibold text-primary-900">Signaler ce profil</h2>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-primary-900">
                    Motif
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    required
                    defaultValue=""
                    className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500"
                  >
                    <option value="" disabled>
                      Choisis un motif
                    </option>
                    {reportReasons.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="details" className="block text-sm font-medium text-primary-900">
                    Détails (optionnel)
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    rows={3}
                    maxLength={500}
                    className="mt-1.5 w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500"
                  />
                </div>

                {reportState && "error" in reportState && (
                  <p className="text-sm text-red-600">{reportState.error}</p>
                )}

                <button
                  type="submit"
                  disabled={reportPending}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {reportPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {reportPending ? "Envoi..." : "Envoyer le signalement"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
