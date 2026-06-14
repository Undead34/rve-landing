"use client"

import { IconButton } from "../ui/button"

interface TopbarProps {
  breadcrumbs: { label: string; href?: string }[]
  engineStatus?: {
    ready: boolean
    rulesCount: number
  }
}

export function Topbar({ breadcrumbs, engineStatus }: TopbarProps) {
  return (
    <div
      className="flex items-center px-6 gap-4 shrink-0 bg-[var(--bg-elev)] border-b border-[var(--border)]"
      style={{ height: "var(--topbar-h)" }}
    >
      <div className="flex items-center gap-[6px] text-[var(--fs-md)] text-[var(--fg-muted)]">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-[6px]">
            {i > 0 && (
              <span className="text-[var(--fg-subtle)]">/</span>
            )}
            {crumb.href ? (
              <a href={crumb.href} className="text-[var(--fg)] no-underline">
                {crumb.label}
              </a>
            ) : (
              <span className={i === breadcrumbs.length - 1 ? "text-[var(--fg)] font-medium" : ""}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <IconButton icon="search" title="Search" />
        <IconButton icon="command" title="Command palette" />
        {engineStatus && (
          <div className="flex items-center gap-[6px] px-[10px] py-[4px] border border-[var(--border)] rounded-[999px] text-[var(--fs-sm)] text-[var(--fg-muted)] bg-[var(--bg-elev)]">
            <span
              className={`w-[6px] h-[6px] rounded-full bg-[var(--status-active)] ${
                engineStatus.ready ? "animate-[pulse_2s_ease-in-out_infinite]" : ""
              }`}
              style={{
                boxShadow: "0 0 0 2px color-mix(in srgb, var(--status-active) 20%, transparent)",
              }}
            />
            Engine {engineStatus.ready ? "ready" : "loading"} · {engineStatus.rulesCount} rules
          </div>
        )}
      </div>
    </div>
  )
}
