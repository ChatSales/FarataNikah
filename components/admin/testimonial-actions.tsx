"use client";

import { Check, X } from "lucide-react";
import { approveTestimonialAction, rejectTestimonialAction } from "@/actions/admin";

export function TestimonialActions({ testimonialId }: { testimonialId: string }) {
  return (
    <div className="flex gap-2">
      <form action={approveTestimonialAction}>
        <input type="hidden" name="testimonialId" value={testimonialId} />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-cream-50 transition hover:bg-primary-700"
        >
          <Check className="h-3.5 w-3.5" /> Publier
        </button>
      </form>
      <form action={rejectTestimonialAction}>
        <input type="hidden" name="testimonialId" value={testimonialId} />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full border border-primary-200 px-4 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-50"
        >
          <X className="h-3.5 w-3.5" /> Rejeter
        </button>
      </form>
    </div>
  );
}
