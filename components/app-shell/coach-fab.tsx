import Link from "next/link";
import { Sparkles } from "lucide-react";

export function CoachFab() {
  return (
    <Link
      href="/app/coach"
      data-tour="coach-fab"
      className="fixed bottom-20 right-5 z-30 flex items-center gap-2 rounded-full border-2 border-gold-500 bg-primary-900 py-2 pl-2 pr-4 text-sm font-semibold text-cream-50 shadow-lg transition hover:brightness-110 lg:bottom-5"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-primary-900">
        <Sparkles className="h-4 w-4" />
      </span>
      Coach
    </Link>
  );
}
