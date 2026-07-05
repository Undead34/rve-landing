import { EdicionesSection } from "@/components/landing/organisms/ediciones-section";
import { FilosofiaSection } from "@/components/landing/organisms/filosofia-section";
import { HeroSection } from "@/components/landing/organisms/hero-section";
import { LandingFooter } from "@/components/landing/organisms/landing-footer";
import { Navbar } from "@/components/landing/organisms/navbar";
import { PayloadSection } from "@/components/landing/organisms/payload-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FilosofiaSection />
      <EdicionesSection />
      <PayloadSection />
      <LandingFooter />
    </>
  );
}
