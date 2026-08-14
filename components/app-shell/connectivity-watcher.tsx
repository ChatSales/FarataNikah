"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks/use-online-status";

const RETRY_INTERVAL_S = 5;
// Full-screen overlay only kicks in after a short grace period — a
// momentary blip (elevator wifi, a dropped packet) shouldn't block the
// whole app, only the persistent banner reacts instantly.
const OVERLAY_DELAY_MS = 1500;

async function checkConnectivity(): Promise<boolean> {
  try {
    await fetch("/favicon.ico", { method: "HEAD", cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

export function ConnectivityWatcher() {
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RETRY_INTERVAL_S);
  const [checking, setChecking] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isOnline) {
      setShowOverlay(false);
      setAttempts(0);
      setSecondsLeft(RETRY_INTERVAL_S);
      // A tab that spent real time offline likely has stale server data
      // (RSC payloads, action results) — refresh once connectivity is back.
      if (wasOffline.current) {
        router.refresh();
        wasOffline.current = false;
      }
      return;
    }

    wasOffline.current = true;
    const overlayTimer = setTimeout(() => setShowOverlay(true), OVERLAY_DELAY_MS);
    return () => clearTimeout(overlayTimer);
  }, [isOnline, router]);

  const runRetry = useRef<() => void>(() => {});
  runRetry.current = async () => {
    setChecking(true);
    setAttempts((a) => a + 1);
    const ok = await checkConnectivity();
    setChecking(false);
    setSecondsLeft(RETRY_INTERVAL_S);
    if (ok) {
      // The browser's own online/offline events sometimes lag reality —
      // this direct probe is the source of truth once it succeeds.
      setShowOverlay(false);
      setAttempts(0);
      router.refresh();
      wasOffline.current = false;
    }
  };

  useEffect(() => {
    if (!isOnline && !checking) {
      const tick = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            runRetry.current();
            return RETRY_INTERVAL_S;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(tick);
    }
  }, [isOnline, checking]);

  if (isOnline) return null;

  return (
    <>
      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-cream-100 to-primary-50 px-4">
          <div className="animate-scale-in flex max-w-sm flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
              <WifiOff className="h-9 w-9" />
            </span>
            <h1 className="mt-6 text-xl font-bold text-primary-900">Pas de connexion</h1>
            <p className="mt-2 text-sm leading-relaxed text-primary-900/60">
              Il semble que tu sois hors ligne. Vérifie ta connexion internet
              et réessaie.
            </p>
            <p className="mt-3 text-xs text-primary-900/40">
              {attempts} tentative{attempts !== 1 ? "s" : ""} • Prochaine dans {secondsLeft}s
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => runRetry.current()}
                disabled={checking}
                className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-primary-700 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                Réessayer
              </button>
              <a
                href="/"
                className="flex items-center gap-2 rounded-full border border-primary-200 bg-cream-50 px-5 py-2.5 text-sm font-semibold text-primary-800 transition hover:bg-primary-50"
              >
                <Home className="h-4 w-4" />
                Accueil
              </a>
            </div>

            <div className="mt-8 rounded-xl border border-primary-100 bg-primary-50 px-5 py-4">
              <p className="text-sm italic text-primary-800">
                &laquo; Certes, avec la difficulté vient la facilité. &raquo;
              </p>
              <p className="mt-1 text-xs font-medium text-primary-600">
                — Sourate Ash-Sharh, 94:6
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-[110] flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-xs font-medium text-white">
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        Pas de connexion internet
        <span className="hidden text-white/70 sm:inline">
          — Certaines fonctionnalités sont indisponibles
        </span>
      </div>
    </>
  );
}
