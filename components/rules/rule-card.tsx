import type { RuleRowData } from "./rule-table";
import { ModeBadge, ActionBadge, Badge } from "../ui/badge";

interface RuleCardProps {
  rule: RuleRowData;
  onOpen: (code: string) => void;
}

export function RuleCard({ rule, onOpen }: RuleCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) overflow-hidden cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => onOpen(rule.code)}
      onKeyDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(rule.code);
        }
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <ModeBadge mode={rule.mode} />
          <button
            type="button"
            className="icon-btn"
            onClick={(e) => e.stopPropagation()}
          >
            ⋯
          </button>
        </div>
        <div>
          <div className="font-semibold text-[14px] tracking-[-0.01em] mb-[2px]">
            {rule.name}
          </div>
          <div className="font-mono text-[11px] text-(--fg-muted)">
            {rule.code} @ {rule.version}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {rule.tags?.map((t: string) => (
            <Badge key={t} kind="neutral" mono>
              {t}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-(--border-faint)">
          <ActionBadge action={rule.action} />
          <div className="flex gap-3 text-[11px] text-(--fg-muted) font-mono">
            <span title="Score impact">⚖ {rule.score_impact}</span>
            <span title="Rollout">↗ {rule.rollout}%</span>
            <span title="Hits 7d">⊙ {rule.hits_7d.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
