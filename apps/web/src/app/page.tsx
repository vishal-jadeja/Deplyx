import { AIModelBeat } from "@/components/landing/AIModelBeat";
import { FeaturesGallery } from "@/components/landing/FeaturesGallery";
import { FinalCta, Footer } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { LandingRoot } from "@/components/landing/LandingRoot";
import { Nav } from "@/components/landing/Nav";
import { HowItWorks, Problem } from "@/components/landing/Problem";
import { ProductPreview } from "@/components/landing/ProductPreview";

export default function HomePage() {
  return (
    <LandingRoot>
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <FeaturesGallery />
      <ProductPreview />
      <AIModelBeat />
      <FinalCta />
      <Footer />
    </LandingRoot>
  );
}
