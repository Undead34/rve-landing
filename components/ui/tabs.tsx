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
    <div role="tablist" className="flex border-b border-(--border)">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={[
            "px-3 py-2 text-(--fs-md) cursor-pointer select-none",
            "border-b-2 border-transparent mb-[-1px] transition-colors",
            "hover:text-(--fg)",
            value === o.value
              ? "text-(--fg) border-b-(--fg) font-medium"
              : "text-(--fg-muted)",
          ].join(" ")}
        >
          {o.label}
          {o.count != null && (
            <span
              className="ml-[6px] text-(--fg-subtle) tabular-nums"
            >
              {o.count}
            </span>
          )}
        </button>
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
    <div className="inline-flex bg-(--bg-subtle) rounded-(--radius-md) p-[2px] gap-[2px]">
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            "px-[10px] py-[3px] text-(--fs-sm) border-none rounded-[4px] cursor-pointer transition-colors",
            value === opt.value
              ? "bg-(--bg-elev) text-(--fg) shadow-(--shadow-sm) font-medium"
              : "text-(--fg-muted) bg-transparent hover:text-(--fg)",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
