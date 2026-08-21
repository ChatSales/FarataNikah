import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "@/components/marketing/mobile-menu";

const links = [{ href: "/", label: "Accueil" }];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/60 bg-cream-50/90 backdrop-blur">
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary-800">
          <Image src="/farata-icon.png" alt="" width={36} height={36} className="h-8 w-8" priority />
          <span className="text-lg tracking-tight">FarataNikah</span>
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
            href="/signup"
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-sm shadow-primary-900/10 transition hover:bg-primary-700"
          >
            Inscription gratuite
          </Link>
        </div>

        <MobileMenu />
      </nav>
    </header>
  );
}
