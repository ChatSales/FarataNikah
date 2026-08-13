import { Hero } from "@/components/marketing/hero";
import { ProductPreview } from "@/components/marketing/product-preview";
import { WhyFarata } from "@/components/marketing/why-farata";
import { Security } from "@/components/marketing/security";
import { Steps } from "@/components/marketing/steps";
import { CtaBand } from "@/components/marketing/cta-band";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
import { Faq } from "@/components/marketing/faq";
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
        title="Prêt(e) à franchir le pas ?"
        subtitle="La création de profil est gratuite et ne prend que quelques minutes."
        buttonLabel="Créer mon profil"
      />
      <Pricing />
      <TestimonialsCarousel />
      <Testimonials />
      <Faq />
      <QuranVerse />
      <CtaBand
        title="Rejoins une communauté panafricaine de musulmans sérieux"
        subtitle="Où que tu sois en Afrique, ta recherche de mariage mérite un cadre sain et respectueux."
        buttonLabel="Créer mon profil gratuitement"
      />
    </>
  );
}
