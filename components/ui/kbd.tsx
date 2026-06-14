import type { ReactNode } from "react"

interface KbdProps {
  children: ReactNode
}

export function Kbd({ children }: KbdProps) {
  return (
    <span className="font-mono text-[10px] px-[5px] py-[1px] border border-[var(--border-strong)] border-b-2 rounded-[3px] bg-[var(--bg-elev)] text-[var(--fg-muted)]">
      {children}
    </span>
  )
}
