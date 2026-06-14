"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { Icon } from "../ui/icon"
import type { NavItem } from "@/lib/navigation"

const PATH_MAP: Record<string, string> = {
  library: "/rules",
  builder: "/rules/builder",
  console: "/console",
  inspector: "/rules/inspector",
  settings: "/settings",
}

interface SidebarProps {
  currentRoute: string
  navItems: NavItem[]
  adminItems?: NavItem[]
  footer?: ReactNode
}

export function Sidebar({ currentRoute, navItems, adminItems, footer }: SidebarProps) {
  const router = useRouter()

  const handleNavigate = (id: string) => {
    if (id === "dashboard") return
    const path = PATH_MAP[id]
    if (path) router.push(path)
  }
  return (
    <nav
      className="flex flex-col overflow-hidden bg-[var(--bg-elev)] border-r border-[var(--border)]"
      style={{ width: "var(--sidebar-w)" }}
    >
      <div className="flex items-center gap-2 px-3 py-[14px] border-b border-[var(--border-faint)]">
        <div className="w-[22px] h-[22px] rounded-[5px] bg-[var(--accent)] text-[var(--fg-inverse)] grid place-items-center font-mono font-bold text-[11px] tracking-[-0.02em] shrink-0">
          RV
        </div>
        <span className="font-semibold text-[var(--fs-lg)] tracking-[-0.01em]">
          Red Velvet
        </span>
        <span className="font-mono text-[10px] text-[var(--fg-subtle)] px-[5px] py-[1px] bg-[var(--bg-subtle)] rounded-[3px] ml-auto">
          v3.4.1
        </span>
      </div>

      <div className="px-[6px] py-3 flex flex-col gap-[2px]">
        <div className="text-[var(--fs-xs)] text-[var(--fg-subtle)] uppercase tracking-[0.06em] px-2 pb-1 font-medium">
          Workspace
        </div>
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={[
              "flex items-center gap-[10px] px-2 py-[6px] rounded-[var(--radius-sm)] cursor-pointer select-none text-[var(--fs-md)]",
              currentRoute === item.id
                ? "bg-[var(--bg-active)] text-[var(--fg)] font-medium"
                : "text-[var(--fg-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]",
            ].join(" ")}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] text-[var(--fg-subtle)] font-mono">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {adminItems && adminItems.length > 0 && (
        <div className="border-t border-[var(--border-faint)] px-[6px] py-3 flex flex-col gap-[2px]">
          <div className="text-[var(--fs-xs)] text-[var(--fg-subtle)] uppercase tracking-[0.06em] px-2 pb-1 font-medium">
            Admin
          </div>
          {adminItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={[
                "flex items-center gap-[10px] px-2 py-[6px] rounded-[var(--radius-sm)] cursor-pointer select-none text-[var(--fs-md)]",
                currentRoute === item.id
                  ? "bg-[var(--bg-active)] text-[var(--fg)] font-medium"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]",
              ].join(" ")}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {footer && (
        <div className="mt-auto border-t border-[var(--border-faint)] p-3">
          {footer}
        </div>
      )}
    </nav>
  )
}
