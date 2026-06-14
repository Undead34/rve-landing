import type { ReactNode } from "react"
import { ModeBadge, ActionBadge, Badge } from "../ui/badge"

export interface RuleRowData {
  code: string
  name: string
  version: string
  mode: "active" | "staged" | "suspended" | "deactivated"
  action: "allow" | "review" | "block" | "tag_only"
  channels: string[]
  score_impact: number
  rollout: number
  hits_7d: number
  updated_at: string
  tags?: string[]
  description?: string
}

interface RuleTableProps {
  rules: RuleRowData[]
  selected: Set<string>
  onToggle: (code: string) => void
  onToggleAll: () => void
  allSelected: boolean
  onOpen: (code: string) => void
  bulkActions?: ReactNode
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

export function RuleTable({
  rules,
  selected,
  onToggle,
  onToggleAll,
  allSelected,
  onOpen,
  bulkActions,
}: RuleTableProps) {
  return (
    <>
      {bulkActions}
      <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full border-collapse text-[var(--fs-md)]">
          <thead>
            <tr className="text-left font-medium text-[var(--fg-muted)] text-[var(--fs-sm)] bg-[var(--bg-inset)]">
              <th className="w-8 pl-4 py-2 px-3 border-b border-[var(--border)] whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                />
              </th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap">Name</th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap">Mode</th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap">Action</th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap">Channels</th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap text-right tabular-nums">Score</th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap text-right tabular-nums">Rollout</th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap text-right tabular-nums">Hits (7d)</th>
              <th className="py-2 px-3 border-b border-[var(--border)] whitespace-nowrap">Updated</th>
              <th className="w-8 py-2 px-3 border-b border-[var(--border)]"></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr
                key={r.code}
                onClick={() => onOpen(r.code)}
                className="cursor-pointer hover:bg-[var(--bg-hover)]"
              >
                <td
                  className="pl-4 py-[10px] px-3 border-b border-[var(--border-faint)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(r.code)}
                    onChange={() => onToggle(r.code)}
                  />
                </td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)]">
                  <div className="flex flex-col gap-[2px] min-w-0">
                    <span className="font-medium">{r.name}</span>
                    <span className="font-mono text-[11px] text-[var(--fg-muted)]">
                      {r.code}
                      <span className="text-[var(--fg-subtle)]"> @ {r.version}</span>
                    </span>
                  </div>
                </td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)]">
                  <ModeBadge mode={r.mode} />
                </td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)]">
                  <ActionBadge action={r.action} />
                </td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)]">
                  <div className="flex gap-1 flex-wrap">
                    {r.channels.slice(0, 3).map((c) => (
                      <Badge key={c} kind="neutral" mono>{c}</Badge>
                    ))}
                    {r.channels.length > 3 && (
                      <span className="text-[11px] text-[var(--fg-subtle)]">+{r.channels.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)] text-right tabular-nums font-mono">{r.score_impact}</td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)] text-right tabular-nums font-mono">{r.rollout}%</td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)] text-right tabular-nums font-mono">{r.hits_7d.toLocaleString()}</td>
                <td className="py-[10px] px-3 border-b border-[var(--border-faint)]">
                  <span className="text-[12px] text-[var(--fg-muted)]">{timeAgo(r.updated_at)}</span>
                </td>
                <td
                  className="py-[10px] px-3 border-b border-[var(--border-faint)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="icon-btn" title="More">
                    <span className="icon-btn-inner">⋯</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
