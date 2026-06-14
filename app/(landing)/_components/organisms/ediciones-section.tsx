import { EditionCard } from "../molecules/edition-card"

export function EdicionesSection() {
  return (
    <section
      id="ediciones"
      className="py-32 bg-paper dark:bg-void transition-colors duration-500"
    >
      <div className="layout-container">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-ink dark:text-cream transition-colors duration-500">
            El Menú de Degustación
          </h2>
          <p className="text-steel dark:text-muted font-mono mt-3 max-w-2xl mx-auto leading-relaxed">
            Software boutique. Añadas exclusivas.
          </p>
        </div>
        <div className="space-y-6">
          <EditionCard
            containerClassName="flex flex-col md:flex-row items-center border border-cherry/30 bg-cherry/5 p-6 hover:bg-cherry/10 transition-colors relative overflow-hidden group"
            iconClassName="text-5xl mr-8 p-4 bg-white dark:bg-void border border-cherry/20 shadow-sm flex-shrink-0"
            title="Black Cherry"
            badge="ESTABLE / v1.0"
            badgeClassName="font-mono text-xs text-cherry border border-cherry/30 px-2 py-0.5"
            profile="Perfil: Ácido, directo, sin estado."
            description="> Implementación del pipeline central. Bloqueos de baja latencia."
            emoji="🍒"
            showActiveIndicator
          />
          <EditionCard
            containerClassName="flex flex-col md:flex-row items-center border border-white/10 bg-[#F9F9FA] dark:bg-[#0A0A0A] p-6 hover:bg-[#F4F4F6] dark:hover:bg-[#111111] transition-colors relative overflow-hidden group opacity-80"
            iconClassName="text-5xl mr-8 p-4 bg-white dark:bg-void border border-white/10 shadow-sm flex-shrink-0"
            title="Bitter Cocoa"
            badge="PRÓXIMAMENTE / v1.1"
            badgeClassName="font-mono text-xs text-steel border border-white/10 px-2 py-0.5"
            profile="Perfil: Denso, enfocado en extracción."
            description="> Optimización de rendimiento. Reducción de falsos positivos."
            emoji="🍫"
          />
          <EditionCard
            containerClassName="flex flex-col md:flex-row items-center border border-white/5 bg-[#F9F9FA] dark:bg-[#070707] p-6 transition-colors relative overflow-hidden group opacity-60"
            iconClassName="text-5xl mr-8 p-4 bg-white dark:bg-void border border-white/5 shadow-sm flex-shrink-0"
            title="Dark Ganache"
            badge="EN DESARROLLO / v1.2"
            badgeClassName="font-mono text-xs text-steel border border-white/5 px-2 py-0.5"
            profile="Perfil: Oscuro, calibración extrema."
            description="> Detección de anomalías avanzada. Hardening de seguridad."
            emoji="🖤"
          />
        </div>
      </div>
    </section>
  )
}
