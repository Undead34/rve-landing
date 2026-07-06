import { Icon } from "@/components/ui/icon";
import { Badge, type BadgeKind } from "@/components/ui/badge";
import type { RecentSim } from "@/lib/console/default-payload";

interface EventSourcePanelProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  recentSimulations: RecentSim[];
  onSelectSimulation: (sim: RecentSim) => void;
}

export function EventSourcePanel({
  activeSection,
  onSectionChange,
  recentSimulations,
  onSelectSimulation,
}: EventSourcePanelProps) {
  return (
    <div className="border-r border-(--border) p-3 bg-(--bg-elev) overflow-y-auto">
      <div className="text-(--fs-xs) text-(--fg-subtle) uppercase tracking-[0.06em] px-1 pb-2 font-medium">
        Editor type
      </div>
      <div className="flex flex-col gap-[2px] mb-4">
        <button
          type="button"
          onClick={() => onSectionChange("json")}
          className={`flex items-center gap-[10px] w-full px-2 py-[6px] rounded-(--radius-sm) cursor-pointer select-none text-(--fs-md) border-none text-left bg-transparent ${
            activeSection === "json"
              ? "bg-(--bg-active) text-(--fg) font-medium"
              : "text-(--fg-muted) hover:bg-(--bg-hover) hover:text-(--fg)"
          }`}
        >
          <Icon name="code" size={14} />
          <span>JSON Editor</span>
        </button>
      </div>

      <div className="h-[1px] bg-(--border-faint) my-3" />
      <div className="text-(--fs-xs) text-(--fg-subtle) uppercase tracking-[0.06em] px-1 pb-2 font-medium">
        Simulation History
      </div>
      <div className="flex flex-col gap-2">
        {recentSimulations.map((s) => (
          <button
            key={s.id}
            type="button"
            className="w-full text-left p-2 border border-(--border-faint) rounded bg-(--bg-inset) hover:bg-(--bg-hover) cursor-pointer transition-colors"
            onClick={() => onSelectSimulation(s)}
          >
            <div className="flex justify-between items-center gap-1 mb-1">
              <span className="font-mono text-[10px] text-(--fg-subtle)">
                {s.id}
              </span>
              <Badge kind={s.outcome as BadgeKind} dot>
                {s.outcome}
              </Badge>
            </div>
            <div className="text-[11px] text-(--fg-muted) leading-tight truncate">
              {s.label}
            </div>
            <div className="text-[10px] text-(--fg-subtle) mt-1">
              {s.when} · score {s.score}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
