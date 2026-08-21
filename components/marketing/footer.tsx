import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

const navigation = [{ href: "/", label: "Accueil" }];

const legal = [
  { href: "/legal/reglement", label: "Règlement" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/mentions-legales", label: "Mentions légales" },
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/dpa", label: "Accord de traitement (DPA)" },
];

export function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-primary-900 text-primary-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-cream-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-50 p-1">
                <Image src="/farata-icon.png" alt="" width={28} height={28} />
              </span>
              <span className="text-lg tracking-tight">FarataNikah</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-200">
              La plateforme de mariage halal pour musulmans sérieux, partout
              en Afrique.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-medium text-primary-200">
              <ShieldCheck className="h-4 w-4 text-gold-400" />
              RGPD — 100% Conforme
            </div>
            <Link
              href="/signup"
              className="mt-6 inline-flex rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-primary-900 transition hover:bg-gold-400"
            >
              Rejoindre FarataNikah
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream-50">Navigation</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-200">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-gold-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream-50">Légal</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-primary-200">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-gold-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-800 pt-8 text-xs text-primary-300 sm:flex-row">
          <p>© {new Date().getFullYear()} FarataNikah. Tous droits réservés.</p>
          <p>Fait avec ♥ pour la Oumma</p>
        </div>
      </div>
    </footer>
  );
}
