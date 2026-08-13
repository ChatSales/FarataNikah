"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Compass,
  Eye,
  Heart,
  UserPlus,
  Crown,
  Rocket,
  MessageCircle,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { NotificationsBell } from "@/components/app-shell/notifications-bell";

const primaryLinks = [
  { href: "/app/discover", label: "Découvrir", icon: Compass },
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
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  gold?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
        gold
          ? "text-gold-600 hover:text-gold-700"
          : active
            ? "text-primary-700"
            : "text-primary-900/55 hover:text-primary-700"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${gold ? "text-gold-500" : active ? "text-primary-600" : ""}`}
      />
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
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
        <NavIcon href="/app/settings" label="Premium" icon={Crown} active={false} gold />
      </nav>

      <div className="hidden items-center gap-2 lg:flex">
        <div className="mx-1 h-6 w-px bg-primary-100" />
        <NavIcon href="/app/settings" label="Boost" icon={Rocket} active={false} />
        <NavIcon
          href="/app/messages"
          label="Messages"
          icon={MessageCircle}
          active={pathname.startsWith("/app/messages")}
        />
        <NotificationsBell initialUnreadCount={unreadNotificationCount} />

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-label="Menu du profil"
            className="flex items-center gap-1 rounded-full border border-primary-200 p-1 pr-2 text-primary-700 transition hover:bg-primary-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-xl border border-primary-100 bg-cream-50 shadow-lg">
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

      <div className="flex items-center gap-1 lg:hidden">
        <NotificationsBell initialUnreadCount={unreadNotificationCount} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="rounded-md p-2 text-primary-800"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-primary-100 bg-cream-50 px-4 py-4 shadow-lg sm:px-6 lg:hidden">
          <div className="flex flex-col gap-1">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-900/70 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <link.icon className="h-4 w-4" /> {link.label}
              </Link>
            ))}
            <Link
              href="/app/messages"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-900/70 transition hover:bg-primary-50 hover:text-primary-700"
            >
              <MessageCircle className="h-4 w-4" /> Messages
            </Link>
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gold-600 transition hover:bg-gold-400/10"
            >
              <Crown className="h-4 w-4" /> Premium
            </Link>
            <Link
              href="/app/coach"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-900/70 transition hover:bg-primary-50 hover:text-primary-700"
            >
              <Sparkles className="h-4 w-4" /> Coach Amina
            </Link>
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-900/70 transition hover:bg-primary-50 hover:text-primary-700"
            >
              <Settings className="h-4 w-4" /> Paramètres
            </Link>
            {isAdmin && (
              <Link
                href="/admin/verification"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gold-700 transition hover:bg-gold-400/10"
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
          </div>
          <form action={signOutAction} className="mt-3 border-t border-primary-100 pt-3">
            <button
              type="submit"
              className="w-full rounded-full border border-primary-200 px-4 py-2.5 text-sm font-medium text-primary-800 hover:bg-primary-50"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </>
  );
}
