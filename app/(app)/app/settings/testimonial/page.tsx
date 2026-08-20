import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TestimonialForm } from "@/components/settings/testimonial-form";

export default async function TestimonialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/basic-info");

  const { count: pendingCount } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("status", "pending_review");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href="/app/settings"
          aria-label="Retour aux paramètres"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-primary-900">
          <Heart className="h-5 w-5 text-gold-500" /> Partager mon témoignage
        </h1>
      </div>
      <p className="mt-2 text-sm text-primary-900/60">
        Ton expérience peut aider d&apos;autres membres à faire le premier pas.
      </p>

      <div className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <TestimonialForm hasPendingSubmission={(pendingCount ?? 0) > 0} />
      </div>
    </div>
  );
}
