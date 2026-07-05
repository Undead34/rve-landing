# Agent Notes

This repo uses Tailwind CSS v4 syntax.

- Use the canonical CSS-variable shorthand in utilities: `bg-(--token)`, `text-(--token)`, `border-(--token)`, `rounded-(--token)`, `shadow-(--token)`.
- Do not introduce new `...[var(--token)]` arbitrary-value classes for simple CSS variables.
- If Tailwind editor diagnostics suggest `suggestCanonicalClasses`, prefer the canonical form instead of the bracketed `var(...)` form.
- Before doing any broad Tailwind rewrite, check the official Tailwind upgrade guide or codemod first. If one exists, use it before falling back to a targeted manual transform.
- For v3 to v4 migrations, prefer the official upgrade tool: `npx @tailwindcss/upgrade`.
- If a value is not a plain CSS variable reference, keep the explicit arbitrary value syntax and do not rewrite it blindly.
