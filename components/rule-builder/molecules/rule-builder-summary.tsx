"use client";

import { Badge, ModeBadge } from "@/components/ui/badge";
import { useRuleCrud } from "@/lib/hooks/useRuleCrud";
import { useRuleStore } from "@/lib/stores/rule-store";

type SaveStateTone = "muted" | "success" | "danger";

function getSaveState(
  hasSaveError: boolean,
  isDirty: boolean,
  isSaving: boolean,
  ruleId: string | null,
): { label: string; tone: SaveStateTone } {
  if (hasSaveError) {
    return { label: "Save failed", tone: "danger" };
  }

  if (isSaving) {
    return { label: "Saving draft...", tone: "muted" };
  }

  if (ruleId && !isDirty) {
    return { label: "Draft saved", tone: "success" };
  }

  if (isDirty) {
    return { label: "Unsaved changes", tone: "muted" };
  }

  return { label: "New draft", tone: "muted" };
}

const saveStateToneClasses: Record<SaveStateTone, string> = {
  danger: "text-(--status-suspended)",
  muted: "text-(--fg-muted)",
  success: "text-(--status-active)",
};

export function RuleBuilderSummary() {
  const draft = useRuleStore((s) => s.draft);
  const isDirty = useRuleStore((s) => s.isDirty);
  const ruleId = useRuleStore((s) => s.ruleId);
  const { isSaving, saveError } = useRuleCrud();

  const saveState = getSaveState(Boolean(saveError), isDirty, isSaving, ruleId);

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="m-0 text-[18px] font-semibold tracking-[-0.01em]">
          {draft.identity.name || "Untitled rule"}
        </h1>
        <ModeBadge mode={draft.policy.mode} />
        <Badge kind="neutral" mono>
          v{draft.identity.version}
        </Badge>
        <span
          className={["text-[11px]", saveStateToneClasses[saveState.tone]].join(
            " ",
          )}
        >
          {saveState.label}
        </span>
      </div>

      <div className="mt-0.5 font-mono text-[12px] text-(--fg-muted)">
        {draft.identity.code || "No rule code yet"}
      </div>
    </div>
  );
}
