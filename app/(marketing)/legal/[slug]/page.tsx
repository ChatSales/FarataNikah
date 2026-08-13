import { notFound } from "next/navigation";
import { legalPages } from "@/content/legal";

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalPages[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-primary-900">
        {page.title}
      </h1>
      <p className="mt-2 text-sm text-primary-900/50">
        Dernière mise à jour : {page.updatedAt}
      </p>

      <div className="mt-10 space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-primary-900">
              {section.heading}
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-primary-900/80">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
