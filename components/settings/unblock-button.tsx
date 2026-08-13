"use client";

import { useActionState } from "react";
import { unblockProfileAction } from "@/actions/blocking";

export function UnblockButton({ profileId }: { profileId: string }) {
  const [state, formAction, pending] = useActionState(unblockProfileAction, null);

  if (state && "success" in state) {
    return <span className="text-xs text-primary-900/50">Débloqué</span>;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="profileId" value={profileId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-primary-200 px-3.5 py-1.5 text-xs font-medium text-primary-800 transition hover:bg-primary-50 disabled:opacity-60"
      >
        {pending ? "..." : "Débloquer"}
      </button>
    </form>
  );
}
