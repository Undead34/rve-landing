"use client"

interface EngineStatusData {
  status: string
  rules_loaded: number
  rules_in_repo: number
  last_reload_at: string
  last_reload_by: string
  uptime_days: number
  decisions_per_min: number
  p99_latency_ms: number
}

interface ContractData {
  version: string
  supported_assets: string[]
}

interface EngineStatusProps {
  engine: EngineStatusData
  contract: ContractData
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

export function EngineStatus({ engine, contract }: EngineStatusProps) {
  const reloadAgo = timeAgo(engine.last_reload_at)

  return (
    <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden mb-6">
      <div
        className="grid gap-6 p-4"
        style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr" }}
      >
        <div>
          <div className="text-[var(--fs-sm)] text-[var(--fg-muted)] mb-1">Engine status</div>
          <div className="flex items-center gap-[10px] mt-1">
            <span
              className="w-[10px] h-[10px] rounded-full bg-[var(--status-active)] animate-[pulse_2s_ease-in-out_infinite]"
              style={{ boxShadow: "0 0 0 2px color-mix(in srgb, var(--status-active) 20%, transparent)" }}
            />
            <span className="text-[22px] font-semibold tracking-[-0.02em]">Ready</span>
          </div>
          <div className="text-[var(--fs-xs)] text-[var(--fg-subtle)] tabular-nums mt-[6px]">
            Up {engine.uptime_days} days · Last reload {reloadAgo} by{" "}
            <span className="font-mono">{engine.last_reload_by}</span>
          </div>
        </div>

        <div>
          <div className="text-[var(--fs-sm)] text-[var(--fg-muted)] mb-1">Rules loaded</div>
          <div className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">
            {engine.rules_loaded}
            <span className="text-[14px] text-[var(--fg-subtle)] font-normal">
              {" "}/ {engine.rules_in_repo}
            </span>
          </div>
          <div className="text-[var(--fs-xs)] text-[var(--fg-subtle)] tabular-nums">1 staged not yet reloaded</div>
        </div>

        <div>
          <div className="text-[var(--fs-sm)] text-[var(--fg-muted)] mb-1">Decisions / min</div>
          <div className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">
            {engine.decisions_per_min.toLocaleString()}
          </div>
          <div className="text-[var(--fs-xs)] tabular-nums text-[var(--status-active)]">↑ 4.2% vs 7d avg</div>
        </div>

        <div>
          <div className="text-[var(--fs-sm)] text-[var(--fg-muted)] mb-1">p99 latency</div>
          <div className="text-[28px] font-semibold tracking-[-0.02em] tabular-nums">
            {engine.p99_latency_ms}
            <span className="text-[14px] text-[var(--fg-subtle)] font-normal"> ms</span>
          </div>
          <div className="text-[var(--fs-xs)] text-[var(--fg-subtle)] tabular-nums">SLO 50ms</div>
        </div>

        <div>
          <div className="text-[var(--fs-sm)] text-[var(--fg-muted)] mb-1">Contract</div>
          <div className="text-[22px] font-semibold tracking-[-0.02em] font-mono">{contract.version}</div>
          <div className="text-[var(--fs-xs)] text-[var(--fg-subtle)] tabular-nums">{contract.supported_assets.length} assets supported</div>
        </div>
      </div>
    </div>
  )
}
