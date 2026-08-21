"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Compass,
  UserPlus,
  MessageCircle,
  Menu,
  X,
  Eye,
  Heart,
  Crown,
  Sparkles,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

const primaryTabs = [
  { href: "/app/home", label: "Accueil", icon: Home },
  { href: "/app/discover", label: "Découvrir", icon: Compass },
  { href: "/app/requests", label: "Demandes", icon: UserPlus },
  { href: "/app/messages", label: "Messages", icon: MessageCircle },
];

const moreLinks = [
  { href: "/app/visitors", label: "Visiteurs", icon: Eye },
  { href: "/app/favorites", label: "Favoris", icon: Heart },
  { href: "/app/premium", label: "Premium", icon: Crown, gold: true },
  { href: "/app/coach", label: "Coach Amina", icon: Sparkles },
  { href: "/app/settings", label: "Paramètres", icon: Settings },
];

function TabBadge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// The bottom bar is the primary mobile navigation surface — it owns the
// "everything else" drawer too, so the header's hamburger button was
// removed rather than keep two separate triggers for overlapping menus.
export function MobileBottomNav({
  isAdmin,
  pendingRequestsCount,
  unreadMessagesCount,
}: {
  isAdmin: boolean;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  useClickOutside(sheetRef, () => setMoreOpen(false), moreOpen);

  const badgeByHref: Record<string, number | undefined> = {
    "/app/requests": pendingRequestsCount,
    "/app/messages": unreadMessagesCount,
  };

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-primary-900/40 lg:hidden" aria-hidden="true" />
      )}

      {moreOpen && (
        <div
          ref={sheetRef}
          className="animate-fade-up fixed inset-x-0 bottom-16 z-40 rounded-t-2xl border-t border-primary-100 bg-cream-50 p-4 shadow-lg lg:hidden"
          style={{ animationDuration: "0.2s" }}
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm font-semibold text-primary-900">Plus d&apos;options</p>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Fermer"
              className="text-primary-900/40 hover:text-primary-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMoreOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  link.gold
                    ? "text-gold-600 hover:bg-gold-400/10"
                    : "text-primary-900/70 hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/verification"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gold-700 transition hover:bg-gold-400/10"
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
          </div>
          <form action={signOutAction} className="mt-2 border-t border-primary-100 pt-3">
            <button
              type="submit"
              className="w-full rounded-full border border-primary-200 px-4 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-100 bg-cream-50/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          {primaryTabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                data-tour={tab.href === "/app/discover" ? "nav-discover" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                  active ? "text-primary-700" : "text-primary-900/50"
                }`}
              >
                <span className="relative">
                  <tab.icon className={`h-5 w-5 ${active ? "text-primary-600" : ""}`} />
                  <TabBadge count={badgeByHref[tab.href]} />
                </span>
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-label={moreOpen ? "Fermer le menu" : "Plus d'options"}
            aria-expanded={moreOpen}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
              moreOpen ? "text-primary-700" : "text-primary-900/50"
            }`}
          >
            {moreOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            Menu
          </button>
        </div>
      </nav>
    </>
  );
}
