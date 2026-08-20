"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const starterQuestions = [
  "Comment rédiger une bio qui donne envie ?",
  "Quels critères sont vraiment importants pour un mariage ?",
  "Comment aborder une première demande de contact ?",
];

export function CoachChat({
  initialMessages,
  isPremium,
}: {
  initialMessages: ChatMessage[];
  isPremium: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text || pending) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setPending(true);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text();
        setError(errorText || "Une erreur est survenue.");
        setPending(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: assistantText };
          return next;
        });
      }
    } catch {
      setError("Connexion perdue. Réessaie.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md text-center text-sm text-primary-900/60">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary-400" />
            As-salamu alaykum ! Je suis Amina, ta coach pour t&apos;accompagner
            vers un mariage serein. Pose-moi une question pour commencer.
            {!isPremium && (
              <p className="mt-2 text-xs text-primary-900/45">
                Plan gratuit : 3 questions par jour.
              </p>
            )}
            <div className="mt-5 flex flex-col items-center gap-2">
              {starterQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="w-full max-w-sm rounded-full border border-primary-200 bg-cream-50 px-4 py-2 text-left text-xs font-medium text-primary-800 transition hover:border-primary-400 hover:bg-primary-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary-600 text-cream-50"
                  : "bg-primary-100 text-primary-900"
              }`}
            >
              {m.content || (pending && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
        {error && (
          <p className="mx-auto max-w-md rounded-lg bg-red-50 px-3.5 py-2.5 text-center text-sm text-red-700">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input.trim());
        }}
        className="border-t border-primary-100 p-4"
      >
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input.trim());
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Écris ta question à Amina..."
            className="flex-1 resize-none rounded-xl border border-primary-200 bg-cream-50 px-3.5 py-2.5 text-sm text-primary-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
            aria-label="Envoyer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
