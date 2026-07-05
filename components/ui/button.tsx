import type { ButtonHTMLAttributes } from "react"
import Link from "next/link"
import { Icon } from "./icon"
import type { IconName } from "./icon"

type ButtonKind = "primary" | "accent" | "ghost" | "danger"
type ButtonSize = "sm"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind
  size?: ButtonSize
  icon?: IconName
  iconAfter?: IconName
  /** Renders as a navigation link instead of a button — no client JS required. */
  href?: string
}

const kindStyles: Record<ButtonKind, string> = {
  primary:
    "bg-(--fg) text-(--bg-elev) border-(--fg) hover:opacity-88",
  accent:
    "bg-(--accent) text-white border-(--accent) hover:bg-(--accent-hover) hover:border-(--accent-hover)",
  ghost:
    "bg-transparent border-transparent hover:bg-(--bg-hover)",
  danger:
    "text-(--accent) hover:bg-(--accent-soft) hover:border-(--accent-border)",
}

export function Button({
  kind,
  size,
  icon,
  iconAfter,
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const cls = [
    "inline-flex items-center gap-[6px] whitespace-nowrap cursor-pointer",
    "text-(--fs-md) font-medium rounded-(--radius-md)",
    "border transition-[background,border-color] duration-[80ms]",
    size === "sm" ? "px-2 py-[3px] text-(--fs-sm)" : "px-3 py-[6px]",
    kind ? kindStyles[kind] : "bg-(--bg-elev) text-(--fg) border-(--border-strong) hover:bg-(--bg-hover)",
    props.disabled ? "opacity-40 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  if (href) {
    return (
      <Link href={href} className={cls}>
        {icon && <Icon name={icon} />}
        {children}
        {iconAfter && <Icon name={iconAfter} />}
      </Link>
    )
  }

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
        "inline-grid place-items-center rounded-(--radius-sm) cursor-pointer border-none",
        "text-(--fg-muted) bg-transparent hover:bg-(--bg-hover) hover:text-(--fg)",
        "w-[26px] h-[26px] transition-colors duration-[80ms]",
        className,
      ].join(" ")}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}
