interface SparkProps {
  data: number[]
  height?: number
  accent?: string
}

export function Spark({ data, height = 36, accent }: SparkProps) {
  const max = Math.max(...data, 1)

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px] min-h-[2px] opacity-60"
          style={{
            height: `${(v / max) * 100}%`,
            background: accent ?? "var(--fg-muted)",
          }}
        />
      ))}
    </div>
  )
}
