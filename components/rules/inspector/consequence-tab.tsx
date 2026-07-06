import { ActionBadge, Badge } from "@/components/ui/badge";
import type { FraudRule } from "@/lib/domain/types";

export function ConsequenceTab({ rule }: { rule: FraudRule }) {
  return (
    <div className="bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) p-5">
      <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-(--fg-muted) mb-4 mt-0">
        Consequence details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
            Action
          </div>
          <div>
            <ActionBadge action={rule.enforcement.action} />
          </div>
        </div>
        <div>
          <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
            Score Impact
          </div>
          <div className="font-mono text-[16px] font-medium">
            {rule.enforcement.score_impact} / 10
          </div>
        </div>
        <div>
          <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
            Severity
          </div>
          <div>
            <Badge kind="neutral" mono>
              {rule.enforcement.severity}
            </Badge>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
            Cooldown Window
          </div>
          <div className="font-mono text-[13px]">
            {rule.enforcement.cooldown_ms
              ? `${rule.enforcement.cooldown_ms / 1000}s (${rule.enforcement.cooldown_ms / 60000}m)`
              : "No cooldown"}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
            Enforcement Tags
          </div>
          <div className="flex gap-1 flex-wrap mt-1">
            {rule.enforcement.tags.map((t) => (
              <Badge key={t} kind="neutral" mono>
                {t}
              </Badge>
            ))}
            {rule.enforcement.tags.length === 0 && (
              <span className="text-[12px] text-(--fg-subtle)">None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
