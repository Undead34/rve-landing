interface DayVolume {
  day: string
  allow: number
  review: number
  block: number
  tag_only: number
}

interface VolumeChartProps {
  data: DayVolume[]
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-[6px] text-[12px] text-[var(--fg-muted)]">
      <span className="w-[8px] h-[8px] rounded-[2px]" style={{ background: color }} />
      {label}
    </span>
  )
}

export function VolumeChart({ data }: VolumeChartProps) {
  const max = Math.max(...data.map((d) => d.allow + d.review + d.block + d.tag_only))

  return (
    <div>
      <div className="flex items-end gap-[6px]" style={{ height: 140 }}>
        {data.map((d, i) => {
          const total = d.allow + d.review + d.block + d.tag_only
          const h = (total / max) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full flex flex-col-reverse rounded-[3px_3px_0_0] overflow-hidden min-h-[4px]"
                style={{ height: `${h}%` }}
              >
                <div
                  className="opacity-85"
                  style={{ height: `${(d.allow / total) * 100}%`, background: "var(--status-active)" }}
                />
                <div
                  className="opacity-85"
                  style={{ height: `${(d.review / total) * 100}%`, background: "var(--status-staged)" }}
                />
                <div
                  className="opacity-85"
                  style={{ height: `${(d.tag_only / total) * 100}%`, background: "var(--action-tag)" }}
                />
                <div
                  className="opacity-85"
                  style={{ height: `${(d.block / total) * 100}%`, background: "var(--status-suspended)" }}
                />
              </div>
              <div className="text-[10px] text-[var(--fg-subtle)] tabular-nums">
                {d.day.split(" ")[1]}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-4 mt-4 text-[12px] text-[var(--fg-muted)]">
        <LegendDot color="var(--status-active)" label="Allow" />
        <LegendDot color="var(--status-staged)" label="Review" />
        <LegendDot color="var(--action-tag)" label="Tag only" />
        <LegendDot color="var(--status-suspended)" label="Block" />
      </div>
    </div>
  )
}
