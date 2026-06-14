import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export function Input({ mono, className = "", ...props }: InputProps) {
  return (
    <input
      className={[
        "w-full px-[10px] py-[6px] text-[var(--fs-md)]",
        "text-[var(--fg)] bg-[var(--bg-elev)]",
        "border border-[var(--border-strong)] rounded-[var(--radius-md)]",
        "outline-none transition-[border-color,box-shadow] duration-[80ms]",
        "focus:border-[var(--fg-muted)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--fg-muted)_12%,transparent)]",
        mono ? "font-mono text-[var(--fs-sm)]" : "",
        className,
      ].join(" ")}
      {...props}
    />
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  mono?: boolean
}

export function Select({ mono, className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={[
        "w-full px-[10px] py-[6px] text-[var(--fs-md)]",
        "text-[var(--fg)] bg-[var(--bg-elev)]",
        "border border-[var(--border-strong)] rounded-[var(--radius-md)]",
        "outline-none transition-[border-color,box-shadow] duration-[80ms]",
        "focus:border-[var(--fg-muted)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--fg-muted)_12%,transparent)]",
        mono ? "font-mono text-[var(--fs-sm)]" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </select>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean
}

export function Textarea({ mono, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={[
        "w-full px-[10px] py-[6px] text-[var(--fs-md)]",
        "text-[var(--fg)] bg-[var(--bg-elev)]",
        "border border-[var(--border-strong)] rounded-[var(--radius-md)]",
        "outline-none transition-[border-color,box-shadow] duration-[80ms]",
        "focus:border-[var(--fg-muted)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--fg-muted)_12%,transparent)]",
        "font-mono text-[var(--fs-sm)] min-h-[80px] resize-y",
        mono ? "font-mono text-[var(--fs-sm)]" : "",
        className,
      ].join(" ")}
      {...props}
    />
  )
}
