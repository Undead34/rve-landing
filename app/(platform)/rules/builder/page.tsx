"use client";

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { Icon } from "@/components/ui/icon";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";
import { useRuleStore } from "@/lib/stores/rule-store";
import { useRuleCrud } from "@/lib/hooks/useRuleCrud";
import { useFields } from "@/lib/hooks/useFields";

const BuilderLayout = dynamic(
  () =>
    import("@/components/builder/builder-layout").then((m) => m.BuilderLayout),
  { ssr: false },
);
const BUILDER_SIDEBAR = (
  <Sidebar
    currentRoute="builder"
    navItems={NAV_ITEMS}
    adminItems={ADMIN_ITEMS}
    footer={<SidebarFooter />}
  />
);
const BUILDER_TOPBAR = (
  <Topbar breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule builder" }]} />
);

export default function BuilderPage() {
  const draft = useRuleStore((s) => s.draft);
  const ruleId = useRuleStore((s) => s.ruleId);
  const { saveRule, isSaving: isCrudSaving } = useRuleCrud();
  useFields();

  const handleSave = useCallback(async () => {
    try {
      await saveRule();
    } catch {
      // error handled in store
    }
  }, [saveRule]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      useRuleStore.getState().setRuleId(id);
    }
  }, []);

  useEffect(() => {
    const onSave = () => {
      handleSave();
    };
    window.addEventListener("rve-save-rule", onSave);
    return () => window.removeEventListener("rve-save-rule", onSave);
  }, [handleSave]);

  return (
    <AppShell noPad sidebar={BUILDER_SIDEBAR} topbar={BUILDER_TOPBAR}>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Rule header */}
        <div
          style={{
            padding: "16px 32px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            background: "var(--bg-elev)",
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {draft.identity.name || "Untitled rule"}
              </h1>
              <span
                className={`badge ${draft.policy.mode}`}
                style={{ fontSize: 11, padding: "2px 8px" }}
              >
                <span className="dot" />
                {draft.policy.mode.charAt(0).toUpperCase() +
                  draft.policy.mode.slice(1)}
              </span>
              <span
                className="badge neutral mono"
                style={{ fontSize: 10, padding: "1px 7px" }}
              >
                v{draft.identity.version}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--fg-muted)",
                  marginLeft: 4,
                }}
              >
                Editing draft · auto-saved 2m ago
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--fg-muted)",
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              {draft.identity.code}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--fg)",
                background: "var(--bg-elev)",
                border: "1px solid var(--border-strong)",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              <Icon name="play" size={14} />
              Simulate
            </button>
            <button
              type="button"
              className="btn sm ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--fg)",
                background: "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isCrudSaving}
              className="btn sm accent"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                background: "var(--accent)",
                color: "white",
                border: "1px solid var(--accent)",
                borderRadius: 6,
                cursor: isCrudSaving ? "not-allowed" : "pointer",
                opacity: isCrudSaving ? 0.4 : 1,
              }}
            >
              <Icon name="check" size={14} />
              {isCrudSaving ? "Saving..." : ruleId ? "Update" : "Save changes"}
            </button>
          </div>
        </div>

        {/* Flexlayout panels */}
        <BuilderLayout />
      </div>
    </AppShell>
  );
}
