interface AuditEntry {
  id: string;
  ts: string;
  by: string;
  what: string;
  detail: string;
}

export function HistoryTab({ auditTrail }: { auditTrail: AuditEntry[] }) {
  return (
    <div className="bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) p-6">
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-[1px] bg-(--border)" />
        {auditTrail.map((item) => (
          <div key={item.id} className="relative pb-6 last:pb-0">
            <div className="absolute left-[-24px] top-1.5 w-3.5 h-3.5 rounded-full bg-(--bg-elev) border-2 border-(--fg)" />
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[13px]">{item.what}</span>
              <span className="font-mono text-[11px] text-(--fg-subtle)">
                {item.by}
              </span>
              <span className="text-[11px] text-(--fg-subtle) ml-auto">
                {item.ts}
              </span>
            </div>
            <div className="text-(--fg-muted) text-[12px]">{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
