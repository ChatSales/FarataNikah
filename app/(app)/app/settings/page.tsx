import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  Ban,
  Camera,
  UserRound,
  MapPin,
  Heart,
  Users,
  BookOpen,
  Home,
  ShieldCheck,
  Bell,
  Lock,
  ChevronRight,
  Crown,
  Gift,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { UnblockButton } from "@/components/settings/unblock-button";
import { computeProfileCompletion } from "@/lib/profile-completion";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, bio, profession, religious_practice_level, interests, life_goals, seeking_criteria"
    )
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/onboarding/basic-info");

  const { count: photoCount } = await supabase
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);
  const hasPhoto = (photoCount ?? 0) > 0;

  const { percent: completionPercent, categories } = computeProfileCompletion({
    bio: profile.bio,
    profession: profile.profession,
    religious_practice_level: profile.religious_practice_level,
    interests: profile.interests,
    life_goals: profile.life_goals,
    seeking_criteria: profile.seeking_criteria as Record<string, unknown>,
    hasPhoto,
  });
  const missingCount = Object.values(categories).filter((done) => !done).length;

  const checklistItems = [
    {
      href: "/onboarding/photos",
      icon: Camera,
      title: "Photo de profil",
      description: "Ta photo principale visible par les autres membres",
      done: categories.photo,
    },
    {
      href: "/app/settings/profile#personal",
      icon: UserRound,
      title: "Informations personnelles",
      description: "Prénom, âge, situation",
      done: categories.personal,
    },
    {
      href: "/app/settings/profile#location",
      icon: MapPin,
      title: "Localisation & Profession",
      description: "Où tu vis et ce que tu fais",
      done: categories.locationProfession,
    },
    {
      href: "/app/settings/profile#vision",
      icon: Heart,
      title: "Vision du mariage",
      description: "Ce que tu recherches dans le mariage",
      done: categories.marriageVision,
    },
    {
      href: "/app/settings/profile#personality",
      icon: Users,
      title: "Personnalité",
      description: "Tes centres d'intérêt et traits de caractère",
      done: categories.personality,
    },
    {
      href: "/app/settings/profile#religious",
      icon: BookOpen,
      title: "Pratique religieuse",
      description: "Ta pratique et tes connaissances",
      done: categories.religiousPractice,
    },
    {
      href: "/app/settings/profile#lifeplans",
      icon: Home,
      title: "Projet de vie",
      description: "Tes projets et aspirations",
      done: categories.lifePlans,
    },
  ];

  const { data: blocks } = await supabase
    .from("blocked_profiles")
    .select("id, blocked_profile_id")
    .eq("blocker_profile_id", profile.id);

  const blockedIds = (blocks ?? []).map((b) => b.blocked_profile_id);
  const { data: blockedProfiles } = blockedIds.length
    ? await supabase.from("profiles").select("id, first_name").in("id", blockedIds)
    : { data: [] };
  const blockedNameById = new Map((blockedProfiles ?? []).map((p) => [p.id, p.first_name]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-primary-900">Paramètres</h1>
      <p className="mt-1 text-sm text-primary-900/55">Personnalise ton profil</p>

      <section className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-900">Complète ton profil</p>
            <p className="text-xs text-primary-900/55">
              {missingCount === 0
                ? "Ton profil est complet"
                : `${missingCount} information${missingCount > 1 ? "s" : ""} manquante${missingCount > 1 ? "s" : ""}`}
            </p>
          </div>
          <span className="text-2xl font-bold text-primary-600">{completionPercent}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-primary-100">
          <div
            className="h-full rounded-full bg-primary-600 transition-[width] duration-700 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </section>

      <div className="mt-4 space-y-2.5">
        {checklistItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`flex items-center justify-between rounded-2xl border bg-cream-50 p-4 transition hover:shadow-sm ${
              item.done ? "border-primary-100" : "border-gold-300 hover:border-gold-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <item.icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary-900">{item.title}</p>
                <p className="text-xs text-primary-900/55">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-primary-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gold-500" />
              )}
              <ChevronRight className="h-4 w-4 text-primary-400" />
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-primary-100 bg-cream-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary-900/60">
          Compte
        </h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-primary-900">
          <Mail className="h-4 w-4 text-primary-500" /> {profile.email}
        </p>
      </section>

      <div className="mt-6 space-y-2.5">
        <Link
          href="/app/premium"
          className="flex items-center justify-between rounded-2xl border border-gold-300 bg-gold-50/60 p-4 transition hover:border-gold-400 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-primary-900">
              <Crown className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">Premium & Boost</p>
              <p className="text-xs text-primary-900/55">Abonnement, tarifs et visibilité</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary-400" />
        </Link>

        <Link
          href="/app/settings/parrainage"
          className="flex items-center justify-between rounded-2xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Gift className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">Parrainage</p>
              <p className="text-xs text-primary-900/55">Invite tes proches, gagne des boosts</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary-400" />
        </Link>

        <Link
          href="/app/settings/profile#privacy"
          className="flex items-center justify-between rounded-2xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">Confidentialité</p>
              <p className="text-xs text-primary-900/55">Contrôle qui peut voir tes photos</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary-400" />
        </Link>

        <Link
          href="/app/notifications"
          className="flex items-center justify-between rounded-2xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Bell className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">Notifications</p>
              <p className="text-xs text-primary-900/55">Gérer tes préférences de notification</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary-400" />
        </Link>

        <Link
          href="/app/settings/profile#security"
          className="flex items-center justify-between rounded-2xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Lock className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">Sécurité</p>
              <p className="text-xs text-primary-900/55">Mot de passe et vérification d&apos;identité</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary-400" />
        </Link>

        <Link
          href="/app/settings/testimonial"
          className="flex items-center justify-between rounded-2xl border border-primary-100 bg-cream-50 p-4 transition hover:border-primary-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Heart className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary-900">Partager mon témoignage</p>
              <p className="text-xs text-primary-900/55">Aide d&apos;autres membres à franchir le pas</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary-400" />
        </Link>
      </div>

      {blocks && blocks.length > 0 && (
        <section className="mt-6 rounded-2xl border border-primary-100 bg-cream-50 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary-900/60">
            <Ban className="h-4 w-4" /> Profils bloqués
          </h2>
          <ul className="mt-3 space-y-2">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-primary-100 px-3.5 py-2.5"
              >
                <span className="text-sm text-primary-900">
                  {blockedNameById.get(b.blocked_profile_id) ?? "Profil"}
                </span>
                <UnblockButton profileId={b.blocked_profile_id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-red-100 bg-cream-50 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700/80">
          Compte — Zone de danger
        </h2>
        <div className="mt-3">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
