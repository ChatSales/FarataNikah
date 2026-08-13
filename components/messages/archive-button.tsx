"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import {
  archiveConversationAction,
  unarchiveConversationAction,
} from "@/actions/conversations";

export function ArchiveButton({
  conversationId,
  archived,
}: {
  conversationId: string;
  archived: boolean;
}) {
  const [, formAction, pending] = useActionState(
    archived ? unarchiveConversationAction : archiveConversationAction,
    null
  );

  return (
    <form action={formAction} onClick={(e) => e.stopPropagation()}>
      <input type="hidden" name="conversationId" value={conversationId} />
      <button
        type="submit"
        disabled={pending}
        aria-label={archived ? "Désarchiver" : "Archiver"}
        title={archived ? "Désarchiver" : "Archiver"}
        className="flex h-8 w-8 items-center justify-center rounded-full text-primary-900/40 transition hover:bg-primary-100 hover:text-primary-700 disabled:opacity-60"
      >
        {archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
      </button>
    </form>
  );
}
