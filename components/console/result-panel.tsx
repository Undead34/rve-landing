import { useState } from "react"
import { Badge, ActionBadge } from "../ui/badge"
import { Button } from "../ui/button"
import { Icon } from "../ui/icon"

interface RuleHit {
  rule_id: string
  version: string
  action: string
  severity: string
  score_delta: number
  reason?: string
}

interface DecisionResult {
  event_id: string
  outcome: string
  score: number
  duration_ms: number
  rules_evaluated: number
  rules_hit: RuleHit[]
}

interface TraceStep {
  step: number
  phase: string
  action: string
  detail: string
  duration_us: number
  hit?: boolean
  ruleAction?: string
}

interface ResultPanelProps {
  decision: DecisionResult | null
  trace: TraceStep[]
  onNavigate?: (id: string) => void
}

const outcomeColors: Record<string, string> = {
  allow: "var(--action-allow)",
  review: "var(--action-review)",
  block: "var(--action-block)",
  tag_only: "var(--action-tag)",
}

const phaseColors: Record<string, string> = {
  preprocess: "var(--fg-muted)",
  enrich: "var(--action-tag)",
  evaluate: "var(--accent)",
  decide: "var(--fg)",
  emit: "var(--status-active)",
}

export function ResultPanel({ decision, trace, onNavigate }: ResultPanelProps) {
  const [traceOpen, setTraceOpen] = useState(true)

  if (!decision) {
    return (
      <aside className="border-l border-[var(--border)] bg-[var(--bg-elev)]">
        <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] text-[var(--fg-muted)] grid place-items-center">
            <Icon name="simulator" size={20} />
          </div>
          <div>
            <div className="text-[14px] font-medium">Ready to evaluate</div>
            <div className="text-[12px] text-[var(--fg-muted)] mt-[2px]">Build an event and press Evaluate.</div>
          </div>
        </div>
      </aside>
    )
  }

  const outcomeColor = outcomeColors[decision.outcome] ?? "var(--fg-muted)"

  return (
    <aside className="border-l border-[var(--border)] bg-[var(--bg-elev)] flex flex-col overflow-hidden">
      <div className="p-5 border-b border-[var(--border-faint)]" style={{ background: `color-mix(in srgb, ${outcomeColor} 6%, var(--bg-elev))` }}>
        <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--fg-muted)] mb-[6px]">Decision</div>
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className="text-[26px] font-semibold tracking-[-0.02em] uppercase"
            style={{ color: outcomeColor }}
          >
            {decision.outcome}
          </span>
          <span className="font-mono text-[14px] text-[var(--fg-muted)]">{decision.event_id}</span>
        </div>

        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-[var(--fg-muted)]">Score</span>
            <span className="font-mono text-[13px] font-semibold">{decision.score} / 10</span>
          </div>
          <div className="h-[6px] bg-[var(--bg-subtle)] rounded-[3px] overflow-hidden relative">
            <div
              className="h-full rounded-[3px]"
              style={{ width: `${decision.score * 10}%`, background: outcomeColor }}
            />
            {[3, 7].map((t) => (
              <div
                key={t}
                className="absolute top-0 bottom-0 w-[1px]"
                style={{ left: `${t * 10}%`, background: "var(--border-strong)" }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[var(--fg-subtle)] mt-1">
            <span>0 · allow</span>
            <span style={{ marginLeft: 30 }}>3 · review</span>
            <span>7 · block</span>
            <span>10</span>
          </div>
        </div>

        <div className="flex gap-3 mt-[14px] text-[11px] text-[var(--fg-muted)]">
          <span>⏱ <span className="font-mono">{decision.duration_ms}ms</span></span>
          <span>· {decision.rules_evaluated} rules evaluated</span>
          <span>· {decision.rules_hit.filter((r) => r.score_delta > 0).length} hit</span>
        </div>
      </div>

      <div className="p-4 border-b border-[var(--border-faint)]">
        <h3 className="m-0 mb-[10px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--fg-muted)]">
          Rules hit
        </h3>
        <div className="flex flex-col gap-[6px]">
          {decision.rules_hit.map((r) => {
            const isMiss = r.score_delta === 0 && r.reason
            return (
              <div
                key={`${r.rule_id}:${r.version}`}
                onClick={() => onNavigate?.(r.rule_id)}
                className="p-[8px_10px] border border-[var(--border)] rounded-[6px] cursor-pointer bg-[var(--bg-elev)]"
                style={{ opacity: isMiss ? 0.6 : 1 }}
              >
                <div className="flex justify-between mb-1">
                  <div className="font-mono text-[11px] truncate">
                    {r.rule_id}
                    <span className="text-[var(--fg-subtle)]"> @ {r.version}</span>
                  </div>
                  {!isMiss && (
                    <span className="font-mono text-[11px] font-semibold">+{r.score_delta.toFixed(1)}</span>
                  )}
                </div>
                <div className="flex gap-[6px]">
                  <ActionBadge action={r.action as "allow" | "review" | "block" | "tag_only"} />
                  <Badge kind="neutral" mono>{r.severity}</Badge>
                  {isMiss && (
                    <span className="text-[10px] text-[var(--fg-subtle)] ml-auto">{r.reason}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div
          onClick={() => setTraceOpen(!traceOpen)}
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          style={{ borderBottom: traceOpen ? "1px solid var(--border-faint)" : "none" }}
        >
          <div className="flex items-center gap-[6px]">
            <Icon name={traceOpen ? "chevron-down" : "chevron-right"} size={12} />
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--fg-muted)]">
              Execution trace
            </span>
            <Badge kind="neutral" mono>{trace.length} steps</Badge>
          </div>
          <Button size="sm" kind="ghost" icon="download" />
        </div>
        {traceOpen && (
          <div className="flex-1 overflow-y-auto py-2 bg-[var(--bg-inset)]">
            {trace.map((t, index) => (
              <TraceRow
                key={t.step}
                step={t}
                last={index === trace.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

function TraceRow({ step, last }: { step: TraceStep; last: boolean }) {
  return (
    <div
      className="grid items-start gap-2 px-4 py-[6px]"
      style={{
        gridTemplateColumns: "28px 70px 1fr auto",
        borderBottom: last ? "none" : "1px solid var(--border-faint)",
      }}
    >
      <div className="font-mono text-[10px] text-[var(--fg-subtle)] text-right pt-[1px]">
        {String(step.step).padStart(2, "0")}
      </div>
      <div>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.04em]"
          style={{ color: phaseColors[step.phase] ?? "var(--fg-muted)" }}
        >
          {step.phase}
        </span>
      </div>
      <div className="min-w-0">
        <div
          className="font-mono text-[11px] truncate"
          style={{ color: step.hit ? "var(--accent)" : "var(--fg)" }}
        >
          {step.action}
          {step.hit && <span className="text-[var(--status-active)] ml-[6px]">● HIT</span>}
        </div>
        <div className="text-[10px] text-[var(--fg-muted)] mt-[1px]">{step.detail}</div>
      </div>
      <div className="font-mono text-[10px] text-[var(--fg-subtle)] whitespace-nowrap">{step.duration_us}μs</div>
    </div>
  )
}
