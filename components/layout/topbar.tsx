import { CommandPaletteTriggers } from "./command-palette-triggers";

interface TopbarProps {
  breadcrumbs: { label: string; href?: string }[];
  engineStatus?: {
    ready: boolean;
    rulesCount: number;
  };
}

export function Topbar({ breadcrumbs, engineStatus }: TopbarProps) {
  return (
    <div
      className="flex items-center px-6 gap-4 shrink-0 bg-(--bg-elev) border-b border-(--border)"
      style={{ height: "var(--topbar-h)" }}
    >
      <div className="flex items-center gap-[6px] text-(--fs-md) text-(--fg-muted)">
        {breadcrumbs.map((crumb, i) => (
          <span
            key={`${crumb.href ?? "current"}-${crumb.label}`}
            className="flex items-center gap-[6px]"
          >
            {i > 0 && <span className="text-(--fg-subtle)">/</span>}
            {crumb.href ? (
              <a href={crumb.href} className="text-(--fg) no-underline">
                {crumb.label}
              </a>
            ) : (
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? "text-(--fg) font-medium"
                    : ""
                }
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <CommandPaletteTriggers />
        {engineStatus && (
          <div className="flex items-center gap-[6px] px-[10px] py-[4px] border border-(--border) rounded-[999px] text-(--fs-sm) text-(--fg-muted) bg-(--bg-elev)">
            <span
              className={`w-[6px] h-[6px] rounded-full bg-(--status-active) ${
                engineStatus.ready
                  ? "animate-[pulse_2s_ease-in-out_infinite]"
                  : ""
              }`}
              style={{
                boxShadow:
                  "0 0 0 2px color-mix(in srgb, var(--status-active) 20%, transparent)",
              }}
            />
            Engine {engineStatus.ready ? "ready" : "loading"} ·{" "}
            {engineStatus.rulesCount} rules
          </div>
        )}
      </div>
    </div>
  );
}
