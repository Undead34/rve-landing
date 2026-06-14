const PAYLOAD_JSON_HTML = `<span class="text-[#8A8A93]">{</span>
  <span class="text-[#8A8A93]">"status"</span><span class="text-[#8A8A93]">:</span> <span class="text-cherry">"rejected"</span><span class="text-[#8A8A93]">,</span>
  <span class="text-[#8A8A93]">"reason"</span><span class="text-[#8A8A93]">:</span> <span class="text-[#F4F4F6]">"rule.violation"</span><span class="text-[#8A8A93]">,</span>
  <span class="text-[#8A8A93]">"signature"</span><span class="text-[#8A8A93]">:</span> <span class="text-[#F4F4F6]">"BLOCK_LEGACY_VELOCITY/v2.5.0"</span><span class="text-[#8A8A93]">,</span>
  <span class="text-[#8A8A93]">"score"</span><span class="text-[#8A8A93]">:</span> <span class="text-cherry">9.8</span><span class="text-[#8A8A93]">,</span>
  <span class="text-[#8A8A93]">"edition"</span><span class="text-[#8A8A93]">:</span> <span class="text-[#F4F4F6]">"Black Cherry"</span><span class="text-[#8A8A93]">,</span>
  <span class="text-[#8A8A93]">"processed_in"</span><span class="text-[#8A8A93]">:</span> <span class="text-[#F4F4F6]">"0.8ms"</span>
<span class="text-[#8A8A93]">}</span>`

export function PayloadSection() {
  return (
    <section
      id="payload"
      className="py-24 bg-[#FAFAFA] dark:bg-[#0A0A0A]/80 border-t border-gray-200 dark:border-burgundy/30 transition-colors duration-500"
    >
      <div className="layout-container layout-grid-2col">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-ink dark:text-cream transition-colors duration-500">
            Arrogancia Técnica Justificada
          </h2>
          <p className="text-steel dark:text-muted leading-relaxed max-w-lg transition-colors duration-500">
            El sistema bloquea la transacción, identifica exactamente quién lo
            hizo, especifica la edición activa en las cabeceras HTTP, y cierra
            la conexión. Todo en milisegundos.
          </p>
          <ul className="space-y-3 text-steel dark:text-muted text-sm font-mono transition-colors duration-500">
            <li className="flex items-center gap-2">
              <span className="text-cherry">■</span> Headers inyectados
              silenciosamente
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cherry">■</span> Respuestas JSON predecibles
            </li>
            <li className="flex items-center gap-2">
              <span className="text-cherry">■</span> Logs formateados como
              notas de cata
            </li>
          </ul>
        </div>
        <div className="bg-[#050505] border border-burgundy/30 rounded-xl p-6 font-mono text-sm leading-relaxed">
          <div className="text-[#8A8A93] mb-4 space-y-0.5">
            <div>
              HTTP/1.1{" "}
              <span className="text-cherry font-bold">403 Forbidden</span>
            </div>
            <div>
              X-Fraud-Decision:{" "}
              <span className="text-cherry font-bold">DENY</span>
            </div>
            <div>
              X-Engine-Edition:{" "}
              <span className="text-cream">Black Cherry 🍒</span>
            </div>
          </div>
          <div
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: PAYLOAD_JSON_HTML }}
          />
        </div>
      </div>
    </section>
  )
}
