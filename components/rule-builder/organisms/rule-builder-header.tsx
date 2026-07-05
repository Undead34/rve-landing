import { RuleBuilderActions } from "../molecules/rule-builder-actions";
import { RuleBuilderSummary } from "../molecules/rule-builder-summary";

export function RuleBuilderHeader() {
  return (
    <header className="shrink-0 border-b border-(--border) bg-(--bg-elev) px-8 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <RuleBuilderSummary />
        <RuleBuilderActions />
      </div>
    </header>
  );
}
