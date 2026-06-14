import { HeroActions } from "../molecules/hero-actions"
import { TerminalOutput } from "../molecules/terminal-output"

export function HeroSection() {
  return (
    <main
      id="top"
      className="flex-grow pt-28 pb-16 lg:pt-32 lg:pb-24 relative overflow-hidden flex items-center bg-paper dark:bg-void transition-colors duration-500 min-h-[calc(100vh-5rem)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-12 -z-10 flex justify-center">
        <div className="h-[48rem] w-[48rem] rounded-full bg-burgundy/5 dark:bg-burgundy/15 blur-[160px] transition-colors duration-500" />
      </div>
      <div className="layout-container layout-grid-2col">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-cherry/30 bg-cherry/5 font-mono text-xs text-cherry uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cherry animate-pulse" />
            v0.1.0 Desplegado
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-ink dark:text-cream transition-colors duration-500">
            Precisión sin estado.
            <br />
            <span className="text-steel font-medium dark:text-muted">
              Ejecución implacable.
            </span>
          </h1>
          <p className="text-base md:text-lg text-steel dark:text-muted max-w-lg xl:max-w-xl font-light leading-relaxed transition-colors duration-500">
            El motor de decisiones anti-fraude diseñado como infraestructura
            premium. Sin memoria emocional. Sin latencia. Sin excepciones. Si la
            regla se rompe, la guillotina cae.
          </p>
          <HeroActions />
        </div>
        <TerminalOutput />
      </div>
    </main>
  )
}
