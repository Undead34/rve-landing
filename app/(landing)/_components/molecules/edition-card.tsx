type EditionCardProps = {
  containerClassName: string
  iconClassName: string
  title: string
  badge: string
  badgeClassName: string
  profile: string
  description: string
  emoji: string
  showActiveIndicator?: boolean
}

export function EditionCard({
  containerClassName,
  iconClassName,
  title,
  badge,
  badgeClassName,
  profile,
  description,
  emoji,
  showActiveIndicator = false,
}: EditionCardProps) {
  return (
    <div className={containerClassName}>
      {showActiveIndicator ? (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cherry" />
      ) : null}
      <div className={iconClassName}>{emoji}</div>
      <div className="flex-grow">
        <div className="flex items-baseline gap-4 mb-2">
          <h3 className="text-2xl font-bold text-ink dark:text-cream transition-colors duration-500">
            {title}
          </h3>
          <span className={badgeClassName}>{badge}</span>
        </div>
        <p className="text-ink dark:text-cream font-medium text-sm mb-2 transition-colors duration-500">
          {profile}
        </p>
        <p className="text-sm font-mono text-steel dark:text-muted transition-colors duration-500">
          {description}
        </p>
      </div>
    </div>
  )
}
