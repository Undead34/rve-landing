interface TabOption {
  value: string
  label: string
  count?: number
}

interface TabsProps {
  value: string
  onChange: (value: string) => void
  options: TabOption[]
}

export function Tabs({ value, onChange, options }: TabsProps) {
  return (
    <div className="flex border-b border-[var(--border)]">
      {options.map((o) => (
        <div
          key={o.value}
          onClick={() => onChange(o.value)}
          className={[
            "px-3 py-2 text-[var(--fs-md)] cursor-pointer select-none",
            "border-b-2 border-transparent mb-[-1px] transition-colors",
            "hover:text-[var(--fg)]",
            value === o.value
              ? "text-[var(--fg)] border-b-[var(--fg)] font-medium"
              : "text-[var(--fg-muted)]",
          ].join(" ")}
        >
          {o.label}
          {o.count != null && (
            <span
              className="ml-[6px] text-[var(--fg-subtle)] tabular-nums"
            >
              {o.count}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

interface SegmentedProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

export function Segmented({ value, onChange, options }: SegmentedProps) {
  return (
    <div className="inline-flex bg-[var(--bg-subtle)] rounded-[var(--radius-md)] p-[2px] gap-[2px]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            "px-[10px] py-[3px] text-[var(--fs-sm)] border-none rounded-[4px] cursor-pointer transition-colors",
            value === opt.value
              ? "bg-[var(--bg-elev)] text-[var(--fg)] shadow-[var(--shadow-sm)] font-medium"
              : "text-[var(--fg-muted)] bg-transparent hover:text-[var(--fg)]",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
