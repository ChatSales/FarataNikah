import { Hero } from "@/components/marketing/hero";
import { ProductPreview } from "@/components/marketing/product-preview";
import { WhyFarata } from "@/components/marketing/why-farata";
import { Security } from "@/components/marketing/security";
import { Steps } from "@/components/marketing/steps";
import { CtaBand } from "@/components/marketing/cta-band";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { QuranVerse } from "@/components/marketing/quran-verse";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductPreview />
      <WhyFarata />
      <Security />
      <Steps />
      <CtaBand
        title="Ta moitié t'attend. Qu'est-ce que tu attends ?"
        subtitle="Inscription gratuite. 5 minutes. Zéro engagement."
        buttonLabel="Je me lance"
      />
      <Pricing />
      <Testimonials />
      <QuranVerse />
      <CtaBand
        title="Ta moitié t'attend peut-être ici. Fais le premier pas."
        subtitle="Rejoins une communauté de musulmans sérieux, engagés dans une recherche sincère de mariage."
        buttonLabel="Créer mon profil gratuitement"
      />
    </>
  );
}
