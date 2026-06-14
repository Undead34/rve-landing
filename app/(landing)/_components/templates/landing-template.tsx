import { EdicionesSection } from "../organisms/ediciones-section"
import { FilosofiaSection } from "../organisms/filosofia-section"
import { HeroSection } from "../organisms/hero-section"
import { LandingFooter } from "../organisms/landing-footer"
import { Navbar } from "../organisms/navbar"
import { PayloadSection } from "../organisms/payload-section"

export function LandingTemplate() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FilosofiaSection />
      <EdicionesSection />
      <PayloadSection />
      <LandingFooter />
    </>
  )
}
