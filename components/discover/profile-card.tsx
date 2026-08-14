"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { UserRound, MapPin, Send, Rocket, Loader2 } from "lucide-react";
import { sendContactRequestAction } from "@/actions/contact-requests";

export interface DiscoverProfile {
  id: string;
  displayName: string;
  age: number;
  city: string;
  country: string;
  madhhabLabel: string;
  compatibilityScore: number;
  photoUrl: string | null;
  connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted";
  isBoosted?: boolean;
}

export function ProfileCard({ profile }: { profile: DiscoverProfile }) {
  const [state, formAction, pending] = useActionState(
    sendContactRequestAction,
    null
  );

  const alreadyActedOn = profile.connectionStatus !== "none" || (state && "success" in state);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-cream-50 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/app/profile/${profile.id}`}
        className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-primary-100"
      >
        {profile.photoUrl ? (
          <Image
            src={profile.photoUrl}
            alt={profile.displayName}
            fill
            sizes="(min-width: 1024px) 280px, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary-400">
            <UserRound className="h-12 w-12" />
            <span className="text-xs font-medium">Photo floutée</span>
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-primary-900/80 px-2.5 py-1 text-xs font-semibold text-cream-50">
          {profile.compatibilityScore}% compatible
        </span>
        {profile.isBoosted && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-xs font-semibold text-primary-900">
            <Rocket className="h-3 w-3" /> Boosté
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/app/profile/${profile.id}`} className="font-semibold text-primary-900">
          {profile.displayName}, {profile.age} ans
        </Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-primary-900/60">
          <MapPin className="h-3.5 w-3.5" /> {profile.city}, {profile.country}
        </p>
        <p className="mt-1 text-xs text-primary-900/60">{profile.madhhabLabel}</p>

        <div className="mt-4">
          {alreadyActedOn ? (
            <span className="block rounded-full bg-primary-100 py-2 text-center text-xs font-medium text-primary-700">
              {profile.connectionStatus === "accepted"
                ? "Connecté(e)"
                : profile.connectionStatus === "pending_received"
                  ? "T'a envoyé une demande"
                  : "Demande envoyée"}
            </span>
          ) : (
            <form action={formAction}>
              <input type="hidden" name="recipientProfileId" value={profile.id} />
              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary-600 py-2 text-xs font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {pending ? "Envoi..." : "Envoyer une demande"}
              </button>
            </form>
          )}
          {state && "error" in state && (
            <p className="mt-2 text-center text-[11px] text-red-600">{state.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
