import type { ReactNode } from "react"
import { Icon } from "./icon"

interface FieldProps {
  label?: ReactNode
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-[4px]">
      {label && (
        <label className="text-[var(--fs-sm)] font-medium text-[var(--fg)] flex items-center gap-[4px]">
          {label}
          {required && <span className="text-[var(--accent)]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="text-[var(--fs-xs)] text-[var(--accent)] flex items-center gap-[4px]">
          <Icon name="alert" size={12} />
          {error}
        </div>
      )}
      {hint && !error && (
        <div className="text-[var(--fs-xs)] text-[var(--fg-subtle)]">{hint}</div>
      )}
    </div>
  )
}
