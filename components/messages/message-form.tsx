"use client";

import { useActionState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { sendMessageAction } from "@/actions/messages";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const [state, formAction, pending] = useActionState(sendMessageAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="border-t border-primary-100 p-4">
      <input type="hidden" name="conversationId" value={conversationId} />
      {state && "error" in state && (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          name="content"
          rows={1}
          required
          maxLength={2000}
          placeholder="Écris ton message..."
          className="flex-1 resize-none rounded-xl border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
          aria-label="Envoyer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
