import Link from "next/link";
import { HeartHandshake, Menu } from "lucide-react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/comment-ca-marche", label: "Comment s'inscrire ?" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/60 bg-cream-50/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-cream-50">
            <HeartHandshake className="h-4.5 w-4.5" />
          </span>
          <span className="text-lg tracking-tight">Farata</span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-900/70 transition hover:text-primary-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-primary-800 transition hover:bg-primary-50"
          >
            Se connecter
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-800 transition hover:bg-primary-50"
          >
            Dashboard
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-sm shadow-primary-900/10 transition hover:bg-primary-700"
          >
            Inscription gratuite
          </Link>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="rounded-md p-2 text-primary-800 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>
    </header>
  );
}
