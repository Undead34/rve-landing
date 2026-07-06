import { useState } from "react";

export function ToggleSetting({
  label,
  hint,
  defaultChecked = false,
}: {
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[13px] font-semibold text-(--fg)">{label}</div>
        {hint && (
          <div className="text-[11px] text-(--fg-subtle) mt-0.5">{hint}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className={`w-[34px] h-[20px] rounded-full relative cursor-pointer border-none transition-colors shrink-0 ${
          checked ? "bg-(--accent)" : "bg-(--bg-inset) border border-(--border)"
        }`}
      >
        <div
          className={`w-[14px] h-[14px] rounded-full bg-white absolute top-1/2 -translate-y-1/2 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${
            checked ? "left-[16px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
