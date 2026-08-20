import { Hero } from "@/components/marketing/hero";
import { ProductPreview } from "@/components/marketing/product-preview";
import { WhyFarata } from "@/components/marketing/why-farata";
import { Security } from "@/components/marketing/security";
import { Steps } from "@/components/marketing/steps";
import { CtaBand } from "@/components/marketing/cta-band";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { FALLBACK_STORIES, type Story } from "@/content/testimonials";
import { Faq } from "@/components/marketing/faq";
import { QuranVerse } from "@/components/marketing/quran-verse";
import { Reveal } from "@/components/marketing/reveal";
import { createPublicClient } from "@/lib/supabase/public";

const MAX_STORIES = 5;

export default async function HomePage() {
  const supabase = createPublicClient();
  const { data: approved } = await supabase
    .from("testimonials")
    .select("quote, profile_id")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(MAX_STORIES);

  const profileIds = (approved ?? []).map((t) => t.profile_id);
  const { data: testimonialProfiles } = profileIds.length
    ? await supabase.from("profiles").select("id, first_name, city, is_anonymous").in("id", profileIds)
    : { data: [] };
  const profileById = new Map((testimonialProfiles ?? []).map((p) => [p.id, p]));

  const realStories: Story[] = (approved ?? []).map((t) => {
    const profile = profileById.get(t.profile_id);
    return {
      quote: t.quote,
      name: profile?.is_anonymous ? "Membre FarataNikah" : (profile?.first_name ?? "Membre FarataNikah"),
      city: profile?.city ?? "",
    };
  });

  // Real, admin-approved testimonials always come first; fictional
  // placeholders (clearly not real per their own comment) fill any
  // remaining slots so the carousel never looks sparse in the early days.
  const stories = [...realStories, ...FALLBACK_STORIES].slice(0, MAX_STORIES);

  return (
    <>
      <Hero />
      <Reveal>
        <ProductPreview />
      </Reveal>
      <WhyFarata />
      <Security />
      <Steps />
      <Reveal>
        <CtaBand
          title="Prêt(e) à franchir le pas ?"
          subtitle="La création de profil est gratuite et ne prend que quelques minutes."
          buttonLabel="Créer mon profil"
        />
      </Reveal>
      <Pricing />
      <Reveal>
        <TestimonialsCarousel stories={stories} />
      </Reveal>
      <Testimonials />
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <QuranVerse />
      </Reveal>
      <Reveal>
        <CtaBand
          title="Rejoins une communauté panafricaine de musulmans sérieux"
          subtitle="Où que tu sois en Afrique, ta recherche de mariage mérite un cadre sain et respectueux."
          buttonLabel="Créer mon profil gratuitement"
        />
      </Reveal>
    </>
  );
}
