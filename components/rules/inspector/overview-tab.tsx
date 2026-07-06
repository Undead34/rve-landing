import { ModeBadge, Badge } from "@/components/ui/badge";
import type { FraudRule } from "@/lib/domain/types";

export function OverviewTab({ rule }: { rule: FraudRule }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) p-5">
          <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-(--fg-muted) mb-4 mt-0">
            Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
                Current Mode
              </div>
              <div>
                <ModeBadge mode={rule.state.mode} />
              </div>
            </div>
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
                Rollout Percent
              </div>
              <div className="font-mono font-medium">
                {rule.rollout.percent}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
                Schedule
              </div>
              <div className="text-[13px]">
                {rule.schedule.active_from_ms ? (
                  <div className="font-mono">
                    From{" "}
                    {new Date(
                      rule.schedule.active_from_ms,
                    ).toLocaleDateString()}
                    {rule.schedule.active_until_ms &&
                      ` to ${new Date(rule.schedule.active_until_ms).toLocaleDateString()}`}
                  </div>
                ) : (
                  <span className="text-(--fg-muted)">Always active</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) p-5">
          <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-(--fg-muted) mb-4 mt-0">
            Scope
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1.5">
                Channels
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(rule.scope.channels || []).map((c) => (
                  <Badge key={c} kind="neutral" mono>
                    {c}
                  </Badge>
                ))}
                {(!rule.scope.channels ||
                  rule.scope.channels.length === 0) && (
                  <span className="text-[12px] text-(--fg-subtle)">
                    All channels
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1.5">
                Tags
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(rule.meta.tags || []).map((t) => (
                  <Badge key={t} kind="neutral" mono>
                    {t}
                  </Badge>
                ))}
                {(!rule.meta.tags || rule.meta.tags.length === 0) && (
                  <span className="text-[12px] text-(--fg-subtle)">
                    No tags defined
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) p-5">
          <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-(--fg-muted) mb-4 mt-0">
            Audit logs
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
                Author
              </div>
              <div className="font-mono text-[13px]">{rule.meta.author}</div>
            </div>
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
                Created
              </div>
              <div className="text-[13px]">
                {new Date(rule.state.audit.created_at_ms).toLocaleString()}{" "}
                <span className="text-(--fg-subtle)">by</span>{" "}
                {rule.state.audit.created_by || rule.meta.author}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em] mb-1">
                Last Updated
              </div>
              <div className="text-[13px]">
                {new Date(rule.state.audit.updated_at_ms).toLocaleString()}{" "}
                <span className="text-(--fg-subtle)">by</span>{" "}
                {rule.state.audit.updated_by || rule.meta.author}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
