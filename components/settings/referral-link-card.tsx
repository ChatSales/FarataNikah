"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ReferralLinkCard({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (older browsers, insecure
      // context) — the link is still selectable/readable in the input.
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-primary-200 bg-cream-50 p-2">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 truncate bg-transparent px-2.5 py-1.5 text-sm text-primary-900 outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
          copied
            ? "bg-primary-100 text-primary-700"
            : "bg-primary-600 text-cream-50 hover:bg-primary-700"
        }`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
