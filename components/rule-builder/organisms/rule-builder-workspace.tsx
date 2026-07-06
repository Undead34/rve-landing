"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useFieldsBootstrap } from "@/lib/hooks/useFields";
import { useRuleCrud } from "@/lib/hooks/useRuleCrud";
import { useRuleStore } from "@/lib/stores/rule-store";

// Client-only: flexlayout-react measures the real DOM during render
// (getComputedStyle, window.innerWidth, getBoundingClientRect) with no SSR
// guards, and the HTML5 drag-and-drop backend binds document events on
// construction. Server-rendering this subtree would throw.
const BuilderLayout = dynamic(
  () =>
    import("@/components/builder/builder-layout").then((m) => m.BuilderLayout),
  { ssr: false },
);

export function RuleBuilderWorkspace() {
  const searchParams = useSearchParams();
  const queryRuleId = searchParams.get("id");
  const { loadRule } = useRuleCrud();
  useFieldsBootstrap();

  useEffect(() => {
    if (!queryRuleId) {
      useRuleStore.getState().setRuleId(null);
      return;
    }

    void loadRule(queryRuleId);
  }, [loadRule, queryRuleId]);

  return <BuilderLayout />;
}
