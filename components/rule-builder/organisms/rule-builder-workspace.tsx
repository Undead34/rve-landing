"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useFields } from "@/lib/hooks/useFields";
import { useRuleCrud } from "@/lib/hooks/useRuleCrud";
import { useRuleStore } from "@/lib/stores/rule-store";

const BuilderLayout = dynamic(
  () =>
    import("@/components/builder/builder-layout").then((m) => m.BuilderLayout),
  { ssr: false },
);

export function RuleBuilderWorkspace() {
  const searchParams = useSearchParams();
  const queryRuleId = searchParams.get("id");
  const { loadRule, saveRule } = useRuleCrud();
  useFields();

  useEffect(() => {
    if (!queryRuleId) {
      useRuleStore.getState().setRuleId(null);
      return;
    }

    void loadRule(queryRuleId);
  }, [loadRule, queryRuleId]);

  useEffect(() => {
    const onSave = () => {
      void saveRule();
    };

    window.addEventListener("rve-save-rule", onSave);
    return () => window.removeEventListener("rve-save-rule", onSave);
  }, [saveRule]);

  return <BuilderLayout />;
}
