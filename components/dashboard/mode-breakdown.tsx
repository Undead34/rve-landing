interface RuleCounts {
  active: number
  staged: number
  suspended: number
  deactivated: number
}

interface ModeBreakdownProps {
  counts: RuleCounts
}

const items = [
  { key: "active" as const, label: "Active", hint: "Running in production" },
  { key: "staged" as const, label: "Staged", hint: "Shadow / partial rollout" },
  { key: "suspended" as const, label: "Suspended", hint: "Loaded but not evaluating" },
  { key: "deactivated" as const, label: "Deactivated", hint: "Off / archived" },
]

export function ModeBreakdown({ counts }: ModeBreakdownProps) {
  return (
    <div>
      <div className="flex h-[10px] rounded-[5px] overflow-hidden mb-4 bg-[var(--bg-subtle)]">
        {items.map((i) => (
          <div
            key={i.key}
            title={`${i.label}: ${counts[i.key]}`}
            className="opacity-85"
            style={{
              flex: counts[i.key],
              background: `var(--status-${i.key})`,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {items.map((i) => (
          <div
            key={i.key}
            className="p-[10px_12px] border border-[var(--border)] rounded-lg"
          >
            <div className="flex items-center gap-[6px]">
              <span
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: `var(--status-${i.key})` }}
              />
              <span className="text-[12px] text-[var(--fg-muted)]">{i.label}</span>
            </div>
            <div className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums mt-1">
              {counts[i.key]}
            </div>
            <div className="text-[11px] text-[var(--fg-subtle)]">{i.hint}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
