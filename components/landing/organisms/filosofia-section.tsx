export function FilosofiaSection() {
  return (
    <section
      id="philosophy"
      className="py-24 bg-[#0A0A0A] border-y border-burgundy/20"
    >
      <div className="layout-container">
        <div className="mb-16">
          <h2 className="text-3xl font-mono font-bold text-cream">
            /arquitectura
          </h2>
          <p className="text-muted mt-2">
            Seguridad percibida como una experiencia de lujo.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 border border-white/5 hover:border-cherry/50 bg-[#111111] transition-colors group">
            <div className="text-3xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
              🧠
            </div>
            <h3 className="font-mono text-xl text-cream mb-3">
              Amnésico y Objetivo
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Evaluación en un vacío absoluto. Stateless por diseño. Las
              transacciones pasadas no compran piedad presente. Son matemáticas,
              no sentimentalismos.
            </p>
          </div>
          <div className="p-8 border border-white/5 hover:border-cherry/50 bg-[#111111] transition-colors group">
            <div className="text-3xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
              🔒
            </div>
            <h3 className="font-mono text-xl text-cream mb-3">
              Paranoico y Hermético
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Cada transacción se evalúa desde cero. Sin sesgos acumulativos.
              Sin contexto previo que corrompa. El motor opera en aislamiento
              funcional absoluto.
            </p>
          </div>
          <div className="p-8 border border-white/5 hover:border-cherry/50 bg-[#111111] transition-colors group">
            <div className="text-3xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
              ⚡
            </div>
            <h3 className="font-mono text-xl text-cream mb-3">
              Falla Rápido
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              Si algo no puede verificarse instantáneamente, se bloquea. Sin
              reintentos. Sin piedad. La latencia se mide en microsegundos, las
              excusas no son aceptadas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
