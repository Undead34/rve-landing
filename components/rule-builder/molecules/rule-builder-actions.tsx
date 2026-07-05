"use client";

import { Button } from "@/components/ui/button";
import { useRuleCrud } from "@/lib/hooks/useRuleCrud";
import { useRuleValidation } from "@/lib/hooks/useRuleValidation";
import { useRuleStore } from "@/lib/stores/rule-store";

export function RuleBuilderActions() {
  const ruleId = useRuleStore((s) => s.ruleId);
  const { saveRule, isSaving } = useRuleCrud();
  const { isValid, errorCount } = useRuleValidation();

  const saveDisabled = isSaving || !isValid;
  const saveTitle = !isValid
    ? `Fix ${errorCount} validation error${errorCount === 1 ? "" : "s"} first`
    : undefined;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button type="button" icon="play">
        Simulate
      </Button>
      <Button type="button" kind="ghost">
        Discard
      </Button>
      <Button
        type="button"
        kind="accent"
        icon="check"
        onClick={() => {
          void saveRule();
        }}
        disabled={saveDisabled}
        title={saveTitle}
      >
        {isSaving ? "Saving..." : ruleId ? "Update" : "Save changes"}
      </Button>
    </div>
  );
}
