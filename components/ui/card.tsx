import type { ReactNode, HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={[
        "px-4 py-3 border-b border-[var(--border-faint)] flex items-center justify-between gap-4",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  subtitle?: string
}

export function CardTitle({ children, subtitle }: CardTitleProps) {
  return (
    <div>
      <h3 className="text-[var(--fs-lg)] font-semibold m-0 tracking-[-0.01em]">
        {children}
      </h3>
      {subtitle && (
        <p className="text-[var(--fs-sm)] text-[var(--fg-muted)] mt-[2px] m-0">
          {subtitle}
        </p>
      )}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  noPad?: boolean
  className?: string
}

export function CardBody({ children, noPad, className = "" }: CardBodyProps) {
  return (
    <div className={[noPad ? "" : "p-4", className].join(" ")}>
      {children}
    </div>
  )
}
