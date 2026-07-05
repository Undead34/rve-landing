"use client"

import { useState } from "react"
import Link from "next/link"
import { NavLinks } from "../molecules/nav-links"
import { ThemeToggle } from "../molecules/theme-toggle"
import { trackEvent } from "../../_lib/analytics"
import { DEMO_URL } from "../../_lib/links"

const DEMO_LINK_PROPS = DEMO_URL.startsWith("http")
  ? ({ target: "_blank", rel: "noreferrer noopener" } as const)
  : {}

function trackDemoClick(location: "navbar" | "mobile_menu") {
  trackEvent("cta_click", { location, cta: "solicitar_demo" })
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-[#0A0A0A]/90 backdrop-blur-md border-b border-burgundy/30 w-full z-50 fixed top-0">
      <div className="layout-container h-20 flex items-center justify-between">
        <a
          href="#top"
          className="font-mono font-bold text-xl tracking-tighter flex items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="text-cherry">🍒</span>
          <span className="text-cream">RED_VELVET</span>
        </a>
        <NavLinks />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden md:inline-flex font-mono text-sm px-5 py-2.5 bg-cherry hover:bg-cherry/80 text-white dark:text-cream transition-all duration-300"
          >
            DASHBOARD
          </Link>
          <a
            href={DEMO_URL}
            {...DEMO_LINK_PROPS}
            className="hidden md:inline-flex font-mono text-sm px-5 py-2.5 border border-burgundy hover:border-cherry hover:bg-cherry/10 text-cream transition-all duration-300"
            onClick={() => trackDemoClick("navbar")}
          >
            SOLICITAR DEMO
          </a>
          <button
            type="button"
            className="md:hidden text-cream hover:text-cherry transition-colors"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="font-mono text-lg leading-none">
              {isMenuOpen ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-burgundy/30 bg-[#0A0A0A] px-6 pb-6 pt-4"
        >
          <NavLinks
            className="flex flex-col gap-4 font-mono text-sm text-muted"
            linkClassName="hover:text-cream transition-colors"
            onNavigate={() => setIsMenuOpen(false)}
          />
          <Link
            href="/dashboard"
            className="mt-5 inline-flex w-full items-center justify-center font-mono text-sm px-5 py-2.5 bg-cherry hover:bg-cherry/80 text-white dark:text-cream transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            DASHBOARD
          </Link>
          <a
            href={DEMO_URL}
            {...DEMO_LINK_PROPS}
            className="mt-5 inline-flex w-full items-center justify-center font-mono text-sm px-5 py-2.5 border border-burgundy hover:border-cherry hover:bg-cherry/10 text-cream transition-all duration-300"
            onClick={() => {
              trackDemoClick("mobile_menu")
              setIsMenuOpen(false)
            }}
          >
            SOLICITAR DEMO
          </a>
        </div>
      ) : null}
    </nav>
  )
}
