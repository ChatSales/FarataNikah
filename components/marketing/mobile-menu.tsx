"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [{ href: "/", label: "Accueil" }];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="rounded-md p-2 text-primary-800"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-primary-100 bg-cream-50 px-4 py-4 shadow-lg sm:px-6">
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
          </div>
          <div className="mt-3 flex flex-col gap-2 border-t border-primary-100 pt-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2.5 text-center text-sm font-medium text-primary-800 transition hover:bg-primary-50"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="rounded-full bg-primary-600 px-5 py-2.5 text-center text-sm font-semibold text-cream-50 transition hover:bg-primary-700"
            >
              Inscription gratuite
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
