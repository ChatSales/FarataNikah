"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { Send, Mic, Sparkles, Loader2 } from "lucide-react";
import { sendMessageAction } from "@/actions/messages";
import { VoiceRecorder } from "@/components/messages/voice-recorder";

export function MessageForm({
  conversationId,
  isPremium,
}: {
  conversationId: string;
  isPremium: boolean;
}) {
  const [state, formAction, pending] = useActionState(sendMessageAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [voiceMode, setVoiceMode] = useState(false);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="border-t border-primary-100 p-4">
      {voiceMode ? (
        <div className="flex items-center gap-2">
          <VoiceRecorder conversationId={conversationId} />
          <button
            type="button"
            onClick={() => setVoiceMode(false)}
            className="text-xs font-medium text-primary-900/50 hover:text-primary-900"
          >
            Annuler
          </button>
        </div>
      ) : (
        <form ref={formRef} action={formAction}>
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
              type="button"
              onClick={() => (isPremium ? setVoiceMode(true) : undefined)}
              disabled={!isPremium}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition hover:bg-primary-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={
                isPremium ? "Passer en message vocal" : "Message vocal — réservé au Premium"
              }
              title={isPremium ? "Passer en message vocal" : "Message vocal — réservé au Premium"}
            >
              <Mic className="h-4 w-4" />
              {!isPremium && (
                <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-gold-500" />
              )}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-cream-50 transition hover:scale-105 hover:bg-primary-700 disabled:opacity-60 disabled:hover:scale-100"
              aria-label="Envoyer"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
