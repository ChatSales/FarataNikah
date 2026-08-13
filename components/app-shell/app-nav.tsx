"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Settings } from "lucide-react";
import { signOutAction } from "@/actions/auth";

const links = [
  { href: "/app/discover", label: "Découvrir" },
  { href: "/app/requests", label: "Mes demandes" },
  { href: "/app/messages", label: "Messages" },
  { href: "/app/favorites", label: "Favoris" },
  { href: "/app/visitors", label: "Visiteurs" },
  { href: "/app/coach", label: "Coach Amina" },
];

export function AppNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm font-medium text-primary-900/70 lg:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-primary-700">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 lg:flex">
        <Link
          href="/app/settings"
          aria-label="Paramètres"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-700 transition hover:bg-primary-50"
        >
          <Settings className="h-4 w-4" />
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-800 hover:bg-primary-50"
          >
            Se déconnecter
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="rounded-md p-2 text-primary-800 lg:hidden"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-primary-100 bg-cream-50 px-4 py-4 shadow-lg sm:px-6 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-900/70 transition hover:bg-primary-50 hover:text-primary-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-900/70 transition hover:bg-primary-50 hover:text-primary-700"
            >
              Paramètres
            </Link>
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
