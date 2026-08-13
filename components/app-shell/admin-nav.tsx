"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOutAction } from "@/actions/auth";

const links = [
  { href: "/admin/verification", label: "Vérification" },
  { href: "/admin/moderation", label: "Modération" },
  { href: "/admin/stats", label: "Statistiques" },
];

export function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-6 text-sm font-medium text-primary-100 md:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-gold-300">
            {link.label}
          </Link>
        ))}
      </nav>

      <form action={signOutAction} className="hidden md:block">
        <button
          type="submit"
          className="rounded-full border border-primary-700 px-4 py-2 text-sm font-medium transition hover:bg-primary-800"
        >
          Se déconnecter
        </button>
      </form>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="rounded-md p-2 text-cream-50 md:hidden"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-primary-800 bg-primary-900 px-4 py-4 shadow-lg sm:px-6 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary-100 transition hover:bg-primary-800 hover:text-gold-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <form action={signOutAction} className="mt-3 border-t border-primary-800 pt-3">
            <button
              type="submit"
              className="w-full rounded-full border border-primary-700 px-4 py-2.5 text-sm font-medium text-cream-50 hover:bg-primary-800"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </>
  );
}
