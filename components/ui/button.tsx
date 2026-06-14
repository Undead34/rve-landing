import type { ButtonHTMLAttributes } from "react"
import { Icon } from "./icon"
import type { IconName } from "./icon"

type ButtonKind = "primary" | "accent" | "ghost" | "danger"
type ButtonSize = "sm"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind
  size?: ButtonSize
  icon?: IconName
  iconAfter?: IconName
}

const kindStyles: Record<ButtonKind, string> = {
  primary:
    "bg-[var(--fg)] text-[var(--bg-elev)] border-[var(--fg)] hover:opacity-88",
  accent:
    "bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]",
  ghost:
    "bg-transparent border-transparent hover:bg-[var(--bg-hover)]",
  danger:
    "text-[var(--accent)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent-border)]",
}

export function Button({
  kind,
  size,
  icon,
  iconAfter,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const cls = [
    "inline-flex items-center gap-[6px] whitespace-nowrap cursor-pointer",
    "text-[var(--fs-md)] font-medium rounded-[var(--radius-md)]",
    "border transition-[background,border-color] duration-[80ms]",
    size === "sm" ? "px-2 py-[3px] text-[var(--fs-sm)]" : "px-3 py-[6px]",
    kind ? kindStyles[kind] : "bg-[var(--bg-elev)] text-[var(--fg)] border-[var(--border-strong)] hover:bg-[var(--bg-hover)]",
    props.disabled ? "opacity-40 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button className={cls} {...props}>
      {icon && <Icon name={icon} />}
      {children}
      {iconAfter && <Icon name={iconAfter} />}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  size?: number
}

export function IconButton({ icon, size, className = "", ...props }: IconButtonProps) {
  return (
    <button
      className={[
        "inline-grid place-items-center rounded-[var(--radius-sm)] cursor-pointer border-none",
        "text-[var(--fg-muted)] bg-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]",
        "w-[26px] h-[26px] transition-colors duration-[80ms]",
        className,
      ].join(" ")}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}
