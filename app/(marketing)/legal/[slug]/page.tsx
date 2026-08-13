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
      <div className="mt-4 rounded-lg border border-gold-400 bg-gold-300/20 px-4 py-3 text-sm text-primary-900">
        ⚠️ Contenu provisoire, non revu juridiquement — à ne pas considérer
        comme un texte contractuel définitif.
      </div>
      <div className="prose prose-p:text-primary-900/80 mt-8 space-y-4 text-base leading-relaxed">
        {page.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
