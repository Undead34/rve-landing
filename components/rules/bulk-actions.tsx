import { Button } from "../ui/button"

interface BulkActionsProps {
  count: number
  onClear: () => void
}

export function BulkActions({ count, onClear }: BulkActionsProps) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-[10px] mb-3 bg-[var(--accent-soft)] border border-[var(--accent-border)] rounded-lg">
      <strong className="text-[13px] text-[var(--accent)]">{count} selected</strong>
      <div className="flex items-center ml-4 gap-[6px]">
        <Button size="sm" icon="check">Activate</Button>
        <Button size="sm" icon="clock">Suspend</Button>
        <Button size="sm" icon="x">Deactivate</Button>
        <Button size="sm" icon="copy">Clone</Button>
        <Button size="sm" kind="danger" icon="trash">Delete</Button>
      </div>
      <Button size="sm" kind="ghost" onClick={onClear} style={{ marginLeft: "auto" }}>
        Clear
      </Button>
    </div>
  )
}
