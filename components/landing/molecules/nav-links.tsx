type NavLinksProps = {
  className?: string
  linkClassName?: string
  onNavigate?: () => void
}

const NAV_ITEMS = [
  { href: "#philosophy", label: "/filosofía" },
  { href: "#ediciones", label: "/ediciones" },
  { href: "#payload", label: "/payload" },
]

export function NavLinks({
  className = "hidden md:flex space-x-8 font-mono text-sm text-muted",
  linkClassName = "hover:text-cream transition-colors",
  onNavigate,
}: NavLinksProps) {
  return (
    <div className={className}>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={linkClassName}
          onClick={onNavigate}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
