export function LandingFooter() {
  return (
    <footer className="bg-paper dark:bg-void border-t border-gray-200 dark:border-burgundy/30 py-12 text-center transition-colors duration-500">
      <div className="font-mono text-2xl mb-4">🍒</div>
      <p className="font-mono text-sm text-ink dark:text-cream font-bold tracking-[0.3em] uppercase transition-colors duration-500">
        Red Velvet Engine.{" "}
        <span className="text-steel dark:text-muted font-normal">
          Served cold.
        </span>
      </p>
      <p className="text-xs text-steel dark:text-muted/50 mt-4 transition-colors duration-500">
        © 2026 Stateless Infrastructure.
      </p>
    </footer>
  )
}
