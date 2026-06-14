interface ActivityItem {
  id: number
  kind: string
  rule: string
  version: string
  who: string
  when: string
  note: string
}

interface RecentActivityProps {
  items: ActivityItem[]
}

const kindMap: Record<string, { color: string; label: string }> = {
  updated: { color: "var(--fg-muted)", label: "Updated" },
  created: { color: "var(--status-active)", label: "Created" },
  activated: { color: "var(--status-active)", label: "Activated" },
  staged: { color: "var(--status-staged)", label: "Staged" },
  suspended: { color: "var(--status-suspended)", label: "Suspended" },
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div>
      {items.map((a, i) => {
        const k = kindMap[a.kind] ?? { color: "var(--fg-muted)", label: a.kind }
        const last = i === items.length - 1
        return (
          <div
            key={a.id}
            className="grid items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)]"
            style={{
              gridTemplateColumns: "70px 1fr auto",
              borderBottom: last ? "none" : "1px solid var(--border-faint)",
            }}
          >
            <div
              className="text-[11px] font-medium uppercase tracking-[0.04em]"
              style={{ color: k.color }}
            >
              {k.label}
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[12px] truncate">
                {a.rule}
                <span className="text-[var(--fg-subtle)]"> @ {a.version}</span>
              </div>
              <div className="text-[11px] text-[var(--fg-muted)] truncate">
                {a.note} · <span className="font-mono">{a.who}</span>
              </div>
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">{a.when}</div>
          </div>
        )
      })}
    </div>
  )
}
