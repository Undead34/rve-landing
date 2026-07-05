"use client"

import { trackEvent } from "@/lib/landing/analytics"
import { DEMO_URL } from "@/lib/landing/links"

const DEMO_LINK_PROPS = DEMO_URL.startsWith("http")
  ? ({ target: "_blank", rel: "noreferrer noopener" } as const)
  : {}

export function HeroActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <a
        href={DEMO_URL}
        {...DEMO_LINK_PROPS}
        className="bg-ink text-paper dark:bg-cream dark:text-void font-mono font-bold px-8 py-4 hover:bg-cherry dark:hover:bg-cherry hover:text-white dark:hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        onClick={() => trackEvent("cta_click", { location: "hero", cta: "solicitar_demo" })}
      >
        SOLICITAR DEMO
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <a
        href="#philosophy"
        className="border border-gray-300 dark:border-muted/30 text-steel dark:text-muted font-mono px-8 py-4 hover:border-ink hover:text-ink dark:hover:border-cream dark:hover:text-cream transition-all duration-300 flex items-center justify-center"
        onClick={() => trackEvent("cta_click", { location: "hero", cta: "ver_documentacion" })}
      >
        VER DOCUMENTACIÓN TÉCNICA
      </a>
    </div>
  )
}
