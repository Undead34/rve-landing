type ThemeIconProps = {
  id?: string
  className?: string
}

export function ThemeMoonIcon({ id, className }: ThemeIconProps) {
  return (
    <svg
      id={id}
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}
