"use client";

import { useRuleStore } from "@/lib/stores/rule-store";
import { MetadataSection } from "./metadata-section";
import { ScopeSection } from "./scope-section";
import { PolicySection } from "./policy-section";
import { ConditionsSection } from "./conditions-section";
import { ConsequenceSection } from "./consequence-section";

export function SectionContentPanel() {
  const activeSection = useRuleStore((s) => s.activeSection);
  const draft = useRuleStore((s) => s.draft);
  const setIdentity = useRuleStore((s) => s.setIdentity);
  const setChannels = useRuleStore((s) => s.setChannels);
  const setPolicy = useRuleStore((s) => s.setPolicy);
  const setConditionTree = useRuleStore((s) => s.setConditionTree);
  const setEnforcement = useRuleStore((s) => s.setEnforcement);

  switch (activeSection) {
    case "metadata":
      return (
        <div className="p-6 overflow-auto h-full">
          <MetadataSection
            meta={draft.identity}
            onChange={(meta) => setIdentity(meta)}
          />
        </div>
      );
    case "scope":
      return (
        <div className="p-6 overflow-auto h-full">
          <ScopeSection
            channels={draft.channels}
            onChange={setChannels}
          />
        </div>
      );
    case "policy":
      return (
        <div className="p-6 overflow-auto h-full">
          <PolicySection
            policy={draft.policy}
            onChange={setPolicy}
          />
        </div>
      );
    case "conditions":
      return (
        <div className="h-full">
          <ConditionsSection
            tree={draft.conditionTree}
            onChange={setConditionTree}
          />
        </div>
      );
    case "consequence":
      return (
        <div className="p-6 overflow-auto h-full">
          <ConsequenceSection
            consequence={draft.enforcement}
            onChange={setEnforcement}
          />
        </div>
      );
    default:
      return null;
  }
}
