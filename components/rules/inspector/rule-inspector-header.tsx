import { useRouter } from "next/navigation";
import { ModeBadge, ActionBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FraudRule } from "@/lib/domain/types";

interface RuleInspectorHeaderProps {
  rule: FraudRule;
  onToggleState: (mode: "active" | "suspended" | "deactivated") => void;
  onDelete: () => void;
}

export function RuleInspectorHeader({
  rule,
  onToggleState,
  onDelete,
}: RuleInspectorHeaderProps) {
  const router = useRouter();

  return (
    <>
      <div className="mb-4">
        <Button
          kind="ghost"
          size="sm"
          icon="arrow-left"
          onClick={() => router.push("/rules")}
        >
          Back to library
        </Button>
      </div>

      <div className="page-header flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ModeBadge mode={rule.state.mode} />
            <ActionBadge action={rule.enforcement.action} />
            <Badge kind="neutral" mono>
              v{rule.meta.version}
            </Badge>
            <Badge kind="neutral" mono>
              severity: {rule.enforcement.severity}
            </Badge>
            <Badge kind="neutral" mono>
              score: {rule.enforcement.score_impact}
            </Badge>
          </div>
          <h1 className="text-(--fs-xl) font-semibold tracking-[-0.02em] m-0">
            {rule.meta.name}
          </h1>
          <div className="font-mono text-[13px] text-(--fg-muted) mt-1 mb-2">
            {rule.meta.code || rule.id}
          </div>
          {rule.meta.description && (
            <p className="text-(--fg-muted) text-[14px] m-0 max-w-3xl leading-relaxed">
              {rule.meta.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            icon="play"
            onClick={() => router.push(`/console?id=${rule.id}`)}
          >
            Simulate
          </Button>
          <Button
            icon="edit"
            onClick={() => router.push(`/rules/builder?id=${rule.id}`)}
          >
            Edit
          </Button>
          {rule.state.mode === "active" ? (
            <Button icon="clock" onClick={() => onToggleState("suspended")}>
              Suspend
            </Button>
          ) : (
            <Button
              kind="accent"
              icon="check"
              onClick={() => onToggleState("active")}
            >
              Activate
            </Button>
          )}
          <Button kind="danger" icon="trash" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </>
  );
}
