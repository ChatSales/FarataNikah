"use client";

import { useActionState, useState } from "react";
import { Check, X } from "lucide-react";
import { approveProfileAction, rejectProfileAction } from "@/actions/admin";

export function VerificationActions({ profileId }: { profileId: string }) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveProfileAction,
    null
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectProfileAction,
    null
  );
  const [showReject, setShowReject] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <form action={approveAction}>
          <input type="hidden" name="profileId" value={profileId} />
          <button
            type="submit"
            disabled={approvePending || rejectPending}
            className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
          >
            <Check className="h-4 w-4" /> Approuver
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowReject((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          <X className="h-4 w-4" /> Rejeter
        </button>
      </div>

      {approveState?.error && (
        <p className="text-sm text-red-600">{approveState.error}</p>
      )}

      {showReject && (
        <form action={rejectAction} className="space-y-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
          <input type="hidden" name="profileId" value={profileId} />
          <label htmlFor="reason" className="block text-sm font-medium text-primary-900">
            Motif du rejet (visible par l&apos;utilisateur)
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={2}
            required
            className="w-full rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500"
          />
          {rejectState?.error && (
            <p className="text-sm text-red-600">{rejectState.error}</p>
          )}
          <button
            type="submit"
            disabled={rejectPending}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {rejectPending ? "Envoi..." : "Confirmer le rejet"}
          </button>
        </form>
      )}
    </div>
  );
}
