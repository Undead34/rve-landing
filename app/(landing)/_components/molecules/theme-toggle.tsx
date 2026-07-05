"use client"

import { ThemeMoonIcon } from "../atoms/icons/theme-moon-icon"
import { ThemeSunIcon } from "../atoms/icons/theme-sun-icon"

function toggleTheme() {
  const root = document.documentElement
  const shouldUseDark = !root.classList.contains("dark")

  root.classList.toggle("dark", shouldUseDark)
  window.localStorage.setItem("theme", shouldUseDark ? "dark" : "light")
}

export function ThemeToggle() {
  return (
    <button
      id="theme-toggle"
      type="button"
      aria-label="Cambiar tema"
      className="flex h-11 items-center gap-2 rounded-full border border-burgundy/30 bg-[#151515] px-4 text-muted transition-colors hover:border-cherry/50 hover:text-cream"
      onClick={toggleTheme}
    >
      <ThemeSunIcon id="theme-icon-sun" className="hidden h-4 w-4 dark:block" />
      <ThemeMoonIcon id="theme-icon-moon" className="h-4 w-4 dark:hidden" />
      <span
        id="theme-text"
        className="hidden font-mono text-[0.68rem] uppercase tracking-[0.18em] sm:inline"
      >
        <span className="inline dark:hidden">OSCURO</span>
        <span className="hidden dark:inline">CLARO</span>
      </span>
    </button>
  )
}
