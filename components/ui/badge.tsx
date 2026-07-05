import type { ReactNode } from "react"

export type BadgeKind = "active" | "staged" | "suspended" | "deactivated" | "allow" | "review" | "block" | "tag_only" | "neutral"
export type Mode = "active" | "staged" | "suspended" | "deactivated"
export type Action = "allow" | "review" | "block" | "tag_only"

const kindStyles: Record<BadgeKind, string> = {
  active: "text-(--status-active) bg-(--status-active-bg) border-(--status-active-border)",
  staged: "text-(--status-staged) bg-(--status-staged-bg) border-(--status-staged-border)",
  suspended: "text-(--status-suspended) bg-(--status-suspended-bg) border-(--status-suspended-border)",
  deactivated: "text-(--status-deactivated) bg-(--status-deactivated-bg) border-(--status-deactivated-border)",
  allow: "text-(--action-allow) bg-(--status-active-bg) border-(--status-active-border)",
  review: "text-(--action-review) bg-(--status-staged-bg) border-(--status-staged-border)",
  block: "text-(--action-block) bg-(--status-suspended-bg) border-(--status-suspended-border)",
  tag_only: "text-(--action-tag) bg-[#f5f3ff] border-[#ddd6fe]",
  neutral: "text-(--fg-muted) bg-(--bg-subtle) border-(--border)",
}

interface BadgeProps {
  kind?: BadgeKind
  dot?: boolean
  mono?: boolean
  children: ReactNode
  className?: string
}

export function Badge({ kind = "neutral", dot, mono, children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-[5px] px-[7px] py-[2px]",
        "text-(--fs-xs) font-medium rounded-[999px] border",
        "whitespace-nowrap",
        mono ? "font-mono text-[10px] px-[6px] py-[1px]" : "",
        kindStyles[kind],
        className,
      ].join(" ")}
    >
      {dot && <span className="w-[5px] h-[5px] rounded-full bg-current" />}
      {children}
    </span>
  )
}

const modeLabels: Record<Mode, string> = {
  active: "Active",
  staged: "Staged",
  suspended: "Suspended",
  deactivated: "Deactivated",
}

interface ModeBadgeProps {
  mode: Mode
}

export function ModeBadge({ mode }: ModeBadgeProps) {
  return (
    <Badge kind={mode} dot>
      {modeLabels[mode]}
    </Badge>
  )
}

const actionLabels: Record<Action, string> = {
  allow: "Allow",
  review: "Review",
  block: "Block",
  tag_only: "Tag only",
}

interface ActionBadgeProps {
  action: Action
}

export function ActionBadge({ action }: ActionBadgeProps) {
  return (
    <Badge kind={action} dot>
      {actionLabels[action]}
    </Badge>
  )
}
