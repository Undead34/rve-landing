type ThemeIconProps = {
  id?: string
  className?: string
}

export function ThemeSunIcon({ id, className }: ThemeIconProps) {
  return (
    <svg
      id={id}
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" strokeWidth={1.8} />
      <path
        d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
        strokeLinecap="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}
