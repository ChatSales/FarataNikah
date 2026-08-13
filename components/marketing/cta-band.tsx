import Link from "next/link";

export function CtaBand({
  title,
  subtitle,
  buttonLabel,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-primary-700 px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_15%_15%,white,transparent_35%),radial-gradient(circle_at_85%_85%,var(--color-gold-400),transparent_40%)]" />
        <h2 className="relative text-2xl font-bold text-cream-50 sm:text-3xl">
          {title}
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-primary-100">
          {subtitle}
        </p>
        <Link
          href="/signup"
          className="relative mt-8 inline-flex rounded-full bg-gold-500 px-8 py-3.5 text-base font-semibold text-primary-900 shadow-lg transition hover:bg-gold-400"
        >
          {buttonLabel}
        </Link>
      </div>
    </section>
  );
}
