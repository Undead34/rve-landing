export function SidebarFooter() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5.5 h-5.5 rounded-full bg-(--accent) text-(--fg-inverse) grid place-items-center font-mono text-[10px] font-bold">
        MA
      </div>
      <div className="min-w-0">
        <div className="text-(--fs-sm) font-medium truncate">
          Marisol Alvarez
        </div>
        <div className="text-[10px] text-(--fg-subtle)">Fraud Analyst</div>
      </div>
    </div>
  )
}
