"use client";

import { useActionState } from "react";
import { UserPlus, X } from "lucide-react";
import { addAdminByEmailAction, removeAdminAction } from "@/actions/admin";

export function AddAdminForm() {
  const [state, formAction, pending] = useActionState(addAdminByEmailAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        name="email"
        required
        placeholder="email@exemple.com"
        className="flex-1 rounded-lg border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" />
        {pending ? "Ajout..." : "Ajouter"}
      </button>
      {state && "error" in state && (
        <p className="text-sm text-red-600 sm:basis-full">{state.error}</p>
      )}
    </form>
  );
}

export function RemoveAdminButton({ adminUserId }: { adminUserId: string }) {
  const [state, formAction, pending] = useActionState(removeAdminAction, null);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="adminUserId" value={adminUserId} />
        <button
          type="submit"
          disabled={pending}
          aria-label="Retirer cet administrateur"
          title="Retirer cet administrateur"
          className="flex h-8 w-8 items-center justify-center rounded-full text-primary-900/40 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>
      </form>
      {state && "error" in state && (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      )}
    </div>
  );
}
