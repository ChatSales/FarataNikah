"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Crown, Gift, X } from "lucide-react";

export function HomeBanners({
  showPhotoBanner,
  showPremiumBanner,
  premiumDiscountPercent,
}: {
  showPhotoBanner: boolean;
  showPremiumBanner: boolean;
  premiumDiscountPercent: number;
}) {
  const [photoVisible, setPhotoVisible] = useState(true);
  const [premiumVisible, setPremiumVisible] = useState(true);
  const [referralVisible, setReferralVisible] = useState(true);
  const [photoClosing, setPhotoClosing] = useState(false);
  const [premiumClosing, setPremiumClosing] = useState(false);
  const [referralClosing, setReferralClosing] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {showPhotoBanner && photoVisible && (
        <div
          className={`animate-fade-up grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
            photoClosing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
          onTransitionEnd={() => photoClosing && setPhotoVisible(false)}
        >
          <div className="min-h-0">
            <div className="flex items-center gap-3 rounded-2xl border border-gold-400/40 bg-gold-400/10 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-primary-900">
                <Camera className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary-900">
                  Ton profil sans photo passe inaperçu
                </p>
                <p className="text-xs text-primary-900/60">
                  Ajoute une photo pour apparaître dans la recherche et recevoir des demandes.
                </p>
              </div>
              <Link
                href="/onboarding/photos"
                className="shrink-0 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-primary-900 transition hover:bg-gold-400"
              >
                Ajouter
              </Link>
              <button
                type="button"
                onClick={() => setPhotoClosing(true)}
                aria-label="Fermer"
                className="shrink-0 text-primary-900/40 hover:text-primary-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showPremiumBanner && premiumVisible && (
        <div
          className={`animate-fade-up grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
            premiumClosing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
          style={{ animationDelay: "60ms" }}
          onTransitionEnd={() => premiumClosing && setPremiumVisible(false)}
        >
          <div className="min-h-0">
            <div className="flex items-center gap-3 rounded-2xl bg-primary-900 px-4 py-3.5 text-cream-50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-primary-900">
                <Crown className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  Passe Premium
                  <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-primary-900">
                    -{premiumDiscountPercent}%
                  </span>
                </p>
                <p className="text-xs text-cream-50/70">
                  Demandes illimitées, profil mis en avant, badge Premium
                </p>
              </div>
              <Link
                href="/app/premium"
                className="flex shrink-0 items-center gap-1 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-primary-900 transition hover:bg-gold-400"
              >
                Découvrir
              </Link>
              <button
                type="button"
                onClick={() => setPremiumClosing(true)}
                aria-label="Fermer"
                className="shrink-0 text-cream-50/50 hover:text-cream-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {referralVisible && (
        <div
          className={`animate-fade-up grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
            referralClosing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
          style={{ animationDelay: "120ms" }}
          onTransitionEnd={() => referralClosing && setReferralVisible(false)}
        >
          <div className="min-h-0">
            <div className="flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-cream-50">
                <Gift className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary-900">
                  Invite tes proches, gagne un boost
                </p>
                <p className="text-xs text-primary-900/60">
                  Un boost gratuit dès qu&apos;une personne que tu invites rejoint FarataNikah.
                </p>
              </div>
              <Link
                href="/app/settings/parrainage"
                className="shrink-0 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-cream-50 transition hover:bg-primary-700"
              >
                Inviter
              </Link>
              <button
                type="button"
                onClick={() => setReferralClosing(true)}
                aria-label="Fermer"
                className="shrink-0 text-primary-900/40 hover:text-primary-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
