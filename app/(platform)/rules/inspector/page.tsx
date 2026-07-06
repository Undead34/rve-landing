"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { useRuleInspector } from "@/lib/hooks/useRuleInspector";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";
import { RuleInspectorHeader } from "@/components/rules/inspector/rule-inspector-header";
import { RuleInspectorTabs } from "@/components/rules/inspector/rule-inspector-tabs";
import { OverviewTab } from "@/components/rules/inspector/overview-tab";
import { ConditionsTab } from "@/components/rules/inspector/conditions-tab";
import { ConsequenceTab } from "@/components/rules/inspector/consequence-tab";
import { HistoryTab } from "@/components/rules/inspector/history-tab";
import { RelatedRulesTab } from "@/components/rules/inspector/related-rules-tab";

const INSPECTOR_SIDEBAR = (
  <Sidebar
    currentRoute="inspector"
    navItems={NAV_ITEMS}
    adminItems={ADMIN_ITEMS}
    footer={<SidebarFooter />}
  />
);
const INSPECTOR_TOPBAR = (
  <Topbar
    breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule Inspector" }]}
  />
);

function RuleInspectorContent() {
  const searchParams = useSearchParams();
  const ruleId = searchParams.get("id");
  const [activeTab, setActiveTab] = useState("overview");

  const {
    rule,
    loading,
    engineReady,
    rulesLoadedCount,
    relatedRules,
    handleToggleState,
    handleDelete,
  } = useRuleInspector(ruleId);

  const inspectorDetailTopbar = useMemo(
    () => (
      <Topbar
        breadcrumbs={[
          { label: "Red Velvet" },
          { label: "Rule library" },
          { label: "Rule inspector" },
        ]}
        engineStatus={{ ready: engineReady, rulesCount: rulesLoadedCount }}
      />
    ),
    [engineReady, rulesLoadedCount],
  );

  if (!ruleId) {
    return (
      <AppShell sidebar={INSPECTOR_SIDEBAR} topbar={INSPECTOR_TOPBAR}>
        <div className="p-8 text-center text-(--fg-muted)">
          No rule selected to inspect. Please open library first.
        </div>
      </AppShell>
    );
  }

  if (loading && !rule) {
    return (
      <AppShell sidebar={INSPECTOR_SIDEBAR} topbar={INSPECTOR_TOPBAR}>
        <div className="p-8 text-center text-(--fg-muted)">
          Loading rule details...
        </div>
      </AppShell>
    );
  }

  if (!rule) {
    return (
      <AppShell sidebar={INSPECTOR_SIDEBAR} topbar={INSPECTOR_TOPBAR}>
        <div className="p-8 text-center text-(--fg-muted)">
          Rule not found.
        </div>
      </AppShell>
    );
  }

  // Audit trail logic based on rule audit info
  const auditTrail = [
    {
      id: `updated-${rule.state.audit.updated_at_ms}`,
      ts: new Date(rule.state.audit.updated_at_ms).toLocaleString(),
      by: rule.state.audit.updated_by || rule.meta.author,
      what: "Updated",
      detail: `Rule state mode is ${rule.state.mode}`,
    },
    {
      id: `created-${rule.state.audit.created_at_ms}`,
      ts: new Date(rule.state.audit.created_at_ms).toLocaleString(),
      by: rule.state.audit.created_by || rule.meta.author,
      what: "Created",
      detail: `Initial rule configuration registered with version ${rule.meta.version}`,
    },
  ];

  return (
    <AppShell sidebar={INSPECTOR_SIDEBAR} topbar={inspectorDetailTopbar}>
      <RuleInspectorHeader
        rule={rule}
        onToggleState={handleToggleState}
        onDelete={handleDelete}
      />

      <RuleInspectorTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        historyCount={auditTrail.length}
        relatedCount={relatedRules.length}
      />

      <div>
        {activeTab === "overview" && <OverviewTab rule={rule} />}
        {activeTab === "conditions" && <ConditionsTab rule={rule} />}
        {activeTab === "consequence" && <ConsequenceTab rule={rule} />}
        {activeTab === "history" && <HistoryTab auditTrail={auditTrail} />}
        {activeTab === "related" && (
          <RelatedRulesTab relatedRules={relatedRules} />
        )}
      </div>
    </AppShell>
  );
}

export default function RuleInspectorPage() {
  return (
    <Suspense
      fallback={
        <AppShell sidebar={INSPECTOR_SIDEBAR} topbar={INSPECTOR_TOPBAR}>
          <div className="p-8 text-center text-(--fg-muted)">
            Loading inspector...
          </div>
        </AppShell>
      }
    >
      <RuleInspectorContent />
    </Suspense>
  );
}
