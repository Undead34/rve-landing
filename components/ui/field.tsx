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
        <label className="text-(--fs-sm) font-medium text-(--fg) flex items-center gap-[4px]">
          {label}
          {required && <span className="text-(--accent)">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="text-(--fs-xs) text-(--accent) flex items-center gap-[4px]">
          <Icon name="alert" size={12} />
          {error}
        </div>
      )}
      {hint && !error && (
        <div className="text-(--fs-xs) text-(--fg-subtle)">{hint}</div>
      )}
    </div>
  )
}
