"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Compass,
  Eye,
  Heart,
  UserPlus,
  Crown,
  Rocket,
  MessageCircle,
  Bell,
  Settings,
  UserRound,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

const primaryLinks = [
  { href: "/app/home", label: "Accueil", icon: Home },
  { href: "/app/discover", label: "Découvrir", icon: Compass, dataTour: "nav-discover" },
  { href: "/app/visitors", label: "Visiteurs", icon: Eye },
  { href: "/app/favorites", label: "Favoris", icon: Heart },
  { href: "/app/requests", label: "Demandes", icon: UserPlus },
];

function NavIcon({
  href,
  label,
  icon: Icon,
  active,
  gold,
  badge,
  dataTour,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  gold?: boolean;
  badge?: number;
  dataTour?: string;
}) {
  return (
    <Link
      href={href}
      data-tour={dataTour}
      className={`relative flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
        gold
          ? "text-gold-600 hover:bg-gold-400/10 hover:text-gold-700"
          : active
            ? "bg-primary-50 text-primary-700"
            : "text-primary-900/55 hover:bg-primary-50/60 hover:text-primary-700"
      }`}
    >
      <span className="relative">
        <Icon
          className={`h-5 w-5 ${gold ? "text-gold-500" : active ? "text-primary-600" : ""}`}
        />
        {Boolean(badge) && (
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
            {badge! > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      {label}
    </Link>
  );
}

export function AppNav({
  isAdmin,
  unreadNotificationCount,
}: {
  isAdmin: boolean;
  unreadNotificationCount: number;
}) {
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileMenuRef, () => setProfileMenuOpen(false), profileMenuOpen);

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {primaryLinks.map((link) => (
          <NavIcon
            key={link.href}
            {...link}
            active={pathname.startsWith(link.href)}
          />
        ))}
        <NavIcon
          href="/app/premium"
          label="Premium"
          icon={Crown}
          active={pathname.startsWith("/app/premium")}
          gold
        />
      </nav>

      <div className="hidden items-center gap-2 lg:flex">
        <div className="mx-1 h-6 w-px bg-primary-100" />
        <NavIcon
          href="/app/premium"
          label="Boost"
          icon={Rocket}
          active={pathname.startsWith("/app/premium")}
          dataTour="nav-boost"
        />
        <NavIcon
          href="/app/messages"
          label="Messages"
          icon={MessageCircle}
          active={pathname.startsWith("/app/messages")}
        />
        <NavIcon
          href="/app/notifications"
          label="Notifications"
          icon={Bell}
          active={pathname.startsWith("/app/notifications")}
          badge={unreadNotificationCount}
          dataTour="nav-notifications"
        />

        <div ref={profileMenuRef} className="relative ml-1">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-label="Menu du profil"
            className="flex items-center gap-1 rounded-full border border-primary-200 p-1 pr-2 text-primary-700 transition hover:bg-primary-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <UserRound className="h-3.5 w-3.5" />
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {profileMenuOpen && (
            <div className="animate-dropdown absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-xl border border-primary-100 bg-cream-50 shadow-lg">
              <Link
                href="/app/settings"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-900 transition hover:bg-primary-50"
              >
                <Settings className="h-4 w-4" /> Paramètres
              </Link>
              <Link
                href="/app/coach"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary-900 transition hover:bg-primary-50"
              >
                <Sparkles className="h-4 w-4" /> Coach Amina
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/verification"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gold-700 transition hover:bg-gold-400/10"
                >
                  <ShieldCheck className="h-4 w-4" /> Admin
                </Link>
              )}
              <form action={signOutAction} className="border-t border-primary-100">
                <button
                  type="submit"
                  className="flex w-full items-center px-4 py-2.5 text-left text-sm text-primary-900 transition hover:bg-primary-50"
                >
                  Se déconnecter
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation (tabs + "more" drawer) lives in MobileBottomNav,
          fixed to the bottom of the viewport — the header only keeps a
          quick-glance notifications bell here. */}
      <Link
        href="/app/notifications"
        aria-label="Notifications"
        data-tour="nav-notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50 lg:hidden"
      >
        <Bell className="h-4 w-4" />
        {unreadNotificationCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        )}
      </Link>
    </>
  );
}
