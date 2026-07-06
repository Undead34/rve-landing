interface JsonEditorPanelProps {
  jsonContent: string;
  jsonError: string | null;
  onChange: (value: string) => void;
}

export function JsonEditorPanel({
  jsonContent,
  jsonError,
  onChange,
}: JsonEditorPanelProps) {
  return (
    <div className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span className="text-[12px] font-semibold text-(--fg-muted) uppercase tracking-[0.04em]">
            Request Payload (application/json)
          </span>
          {jsonError && (
            <span className="text-[11px] text-red-400 font-medium">
              Error: {jsonError}
            </span>
          )}
        </div>
        <textarea
          className={`flex-1 font-mono text-[13px] leading-relaxed p-4 rounded-lg bg-(--bg-inset) border outline-none resize-none overflow-y-auto ${
            jsonError
              ? "border-red-500/50 focus:border-red-500"
              : "border-(--border) focus:border-(--accent)"
          }`}
          value={jsonContent}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
