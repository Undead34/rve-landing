"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Actions,
  Action,
  BorderNode,
  Layout,
  Model,
  TabNode,
  TabSetNode,
} from "flexlayout-react";
import { useHotkeys } from "react-hotkeys-hook";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRuleStore } from "@/lib/stores/rule-store";
import { SectionsRailPanel } from "./sections-rail-panel";
import { FieldLibrarySidebar } from "./field-library-sidebar";
import { ValidationPanel } from "./validation-panel";

// Sub-section imports
import { MetadataSection } from "./metadata-section";
import { ScopeSection } from "./scope-section";
import { PolicySection } from "./policy-section";
import { ConsequenceSection } from "./consequence-section";
import {
  GuardConditionCard,
  ConditionsNested,
  ConditionsTreeView,
  ConditionsCodeView,
  ConditionsSummary,
} from "./conditions-section";

const DEFAULT_LAYOUT = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableMaximize: true,
    tabSetEnableSingleTabStretch: false,
    enableEdgeDock: true,
    enableRotateBorderIcons: false,
  },
  borders: [
    {
      type: "border" as const,
      location: "left" as const,
      id: "border_left",
      size: 240,
      selected: 0,
      enableAutoHide: true,
      enableDrop: true,
      children: [
        {
          type: "tab" as const,
          id: "sections",
          name: "Sections",
          component: "sections",
          enableClose: false,
          enableRenderOnDemand: false,
        },
        {
          type: "tab" as const,
          id: "field-library",
          name: "Field Library",
          component: "field-library",
          enableClose: false,
          enableRenderOnDemand: false,
        },
      ],
    },
    {
      type: "border" as const,
      location: "right" as const,
      size: 300,
      selected: -1, // Unselected by default
      enableAutoHide: true,
      enableDrop: true,
      children: [
        {
          type: "tab" as const,
          id: "validation",
          name: "Validation",
          component: "validation",
          enableClose: false,
          enableRenderOnDemand: false,
        },
      ],
    },
  ],
  layout: {
    type: "row" as const,
    children: [
      {
        type: "tabset" as const,
        id: "main_tabset",
        weight: 65,
        selected: 0,
        children: [
          {
            type: "tab" as const,
            id: "conditions-nested",
            name: "nested",
            component: "conditions-nested",
            enableClose: false,
          },
          {
            type: "tab" as const,
            id: "conditions-tree",
            name: "tree",
            component: "conditions-tree",
            enableClose: false,
          },
          {
            type: "tab" as const,
            id: "conditions-code",
            name: "code",
            component: "conditions-code",
            enableClose: false,
          },
        ],
      },
      {
        type: "tabset" as const,
        id: "properties_tabset",
        weight: 35,
        selected: 0,
        children: [
          {
            type: "tab" as const,
            id: "metadata",
            name: "Metadata",
            component: "metadata",
            enableClose: false,
          },
          {
            type: "tab" as const,
            id: "scope",
            name: "Scope",
            component: "scope",
            enableClose: false,
          },
          {
            type: "tab" as const,
            id: "policy",
            name: "Policy",
            component: "policy",
            enableClose: false,
          },
          {
            type: "tab" as const,
            id: "consequence",
            name: "Consequence",
            component: "consequence",
            enableClose: false,
          },
          {
            type: "tab" as const,
            id: "summary",
            name: "Summary",
            component: "summary",
            enableClose: false,
          },
        ],
      },
    ],
  },
};

export function BuilderLayout() {
  const [model] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rve-platform:builder-layout");
      if (saved) {
        try {
          return Model.fromJson(JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load saved builder layout:", e);
        }
      }
    }
    return Model.fromJson(DEFAULT_LAYOUT);
  });

  const draft = useRuleStore((s) => s.draft);
  const setConditionTree = useRuleStore((s) => s.setConditionTree);
  const setIdentity = useRuleStore((s) => s.setIdentity);
  const setChannels = useRuleStore((s) => s.setChannels);
  const setPolicy = useRuleStore((s) => s.setPolicy);
  const setEnforcement = useRuleStore((s) => s.setEnforcement);
  const activeSection = useRuleStore((s) => s.activeSection);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  const factory = useCallback(
    (node: TabNode) => {
      const component = node.getComponent();
      switch (component) {
        case "sections":
          return <SectionsRailPanel />;
        case "field-library":
          return <FieldLibrarySidebar />;
        case "validation":
          return <ValidationPanelWrapper />;

        // Conditions sub-views
        case "conditions-nested":
          return (
            <div className="p-6 overflow-auto h-full flex flex-col gap-4">
              <GuardConditionCard />
              <ConditionsNested
                tree={draft.conditionTree}
                onChange={setConditionTree}
              />
            </div>
          );
        case "conditions-tree":
          return (
            <div className="p-6 overflow-auto h-full">
              <ConditionsTreeView tree={draft.conditionTree} />
            </div>
          );
        case "conditions-code":
          return (
            <div className="p-6 overflow-auto h-full">
              <ConditionsCodeView tree={draft.conditionTree} />
            </div>
          );

        // Section properties views
        case "metadata":
          return (
            <div className="p-6 overflow-auto h-full">
              <MetadataSection meta={draft.identity} onChange={setIdentity} />
            </div>
          );
        case "scope":
          return (
            <div className="p-6 overflow-auto h-full">
              <ScopeSection channels={draft.channels} onChange={setChannels} />
            </div>
          );
        case "policy":
          return (
            <div className="p-6 overflow-auto h-full">
              <PolicySection policy={draft.policy} onChange={setPolicy} />
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
        case "summary":
          return (
            <div className="p-6 overflow-auto h-full">
              <ConditionsSummary tree={draft.conditionTree} />
            </div>
          );
        default:
          return null;
      }
    },
    [
      draft,
      setConditionTree,
      setIdentity,
      setChannels,
      setPolicy,
      setEnforcement,
    ],
  );

  const sections = [
    "metadata",
    "scope",
    "policy",
    "conditions",
    "consequence",
    "summary",
  ];

  // Sync activeSection in store to FlexLayout tabs
  useEffect(() => {
    const tabId =
      activeSection === "conditions" ? "conditions-nested" : activeSection;
    try {
      const node = model.getNodeById(tabId);
      if (node) {
        const parent = node.getParent() as BorderNode | TabSetNode | null;
        if (
          parent &&
          "getSelectedNode" in parent &&
          (parent as BorderNode | TabSetNode).getSelectedNode() !== node
        ) {
          model.doAction(Actions.selectTab(tabId));
        }
      }
    } catch (e) {
      console.warn("Could not sync activeSection to FlexLayout:", e);
    }
  }, [activeSection, model]);

  // Sync custom event tab selection triggers
  useEffect(() => {
    const handleSelectTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tabId: string }>;
      const { tabId } = customEvent.detail;
      try {
        const node = model.getNodeById(tabId);
        if (node) {
          model.doAction(Actions.selectTab(tabId));
        }
      } catch (err) {
        console.warn("Failed to select tab in FlexLayout:", tabId, err);
      }
    };
    window.addEventListener("rve-select-tab", handleSelectTab);
    return () => window.removeEventListener("rve-select-tab", handleSelectTab);
  }, [model]);

  // Sync FlexLayout selections back to the store activeSection
  const handleAction = useCallback(
    (action: Action) => {
      if (action.type === "FlexLayout_SelectTab") {
        const tabId = action.data.tabNode;
        const sectionId =
          tabId === "conditions-nested" ||
          tabId === "conditions-tree" ||
          tabId === "conditions-code"
            ? "conditions"
            : tabId;

        if (sections.includes(sectionId)) {
          setActiveSection(sectionId);
        }
      }
      return action;
    },
    [setActiveSection],
  );

  useHotkeys(
    "alt+shift+left,alt+shift+h",
    () => {
      const idx = sections.indexOf(activeSection);
      if (idx > 0) useRuleStore.getState().setActiveSection(sections[idx - 1]);
    },
    { enableOnFormTags: true },
    [activeSection, sections],
  );

  useHotkeys(
    "alt+shift+right,alt+shift+l",
    () => {
      const idx = sections.indexOf(activeSection);
      if (idx < sections.length - 1)
        useRuleStore.getState().setActiveSection(sections[idx + 1]);
    },
    { enableOnFormTags: true },
    [activeSection, sections],
  );

  const handleModelChange = useCallback((model: Model) => {
    try {
      const json = model.toJson();
      localStorage.setItem("rve-platform:builder-layout", JSON.stringify(json));
    } catch (e) {
      console.error("Failed to save builder layout:", e);
    }
  }, []);

  return (
    <div className="flex-1 min-h-0 min-w-0 relative" style={{ width: "100%" }}>
      <DndProvider backend={HTML5Backend}>
        <Layout
          model={model}
          factory={factory}
          onAction={handleAction}
          classNameMapper={(cls) => cls}
          onModelChange={handleModelChange}
        />
      </DndProvider>
    </div>
  );
}

function ValidationPanelWrapper() {
  const draft = useRuleStore((s) => s.draft);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  const validation = useMemo(() => {
    const errs: { section: string; level: "error" | "warn"; msg: string }[] =
      [];
    const { identity, channels, policy, enforcement } = draft;

    if (!identity.code)
      errs.push({
        section: "metadata",
        level: "error",
        msg: "Rule code is required",
      });
    else if (!/^[a-z][a-z0-9_]+$/.test(identity.code))
      errs.push({
        section: "metadata",
        level: "error",
        msg: "Code must be snake_case",
      });
    if (!identity.name)
      errs.push({
        section: "metadata",
        level: "error",
        msg: "Rule name is required",
      });
    if (!/^\d+\.\d+\.\d+$/.test(identity.version))
      errs.push({
        section: "metadata",
        level: "error",
        msg: "Version must be semver (e.g. 1.0.0)",
      });
    if (channels.length === 0)
      errs.push({
        section: "scope",
        level: "error",
        msg: "At least one channel is required",
      });
    if (enforcement.score_impact < 1 || enforcement.score_impact > 10)
      errs.push({
        section: "consequence",
        level: "error",
        msg: "Score impact must be between 1 and 10",
      });
    if (policy.rollout < 0 || policy.rollout > 100)
      errs.push({
        section: "policy",
        level: "error",
        msg: "Rollout must be between 0 and 100",
      });
    if (
      policy.schedule_from &&
      policy.schedule_to &&
      policy.schedule_from >= policy.schedule_to
    )
      errs.push({
        section: "policy",
        level: "error",
        msg: "Schedule end must be after start",
      });

    const warns: typeof errs = [];
    if (policy.mode === "active" && policy.rollout < 100)
      warns.push({
        section: "policy",
        level: "warn",
        msg: "Active rule with rollout < 100% will only evaluate a subset of traffic",
      });
    if (enforcement.action === "block" && enforcement.score_impact < 7)
      warns.push({
        section: "consequence",
        level: "warn",
        msg: "Block action with low score impact is unusual",
      });

    return [...errs, ...warns];
  }, [draft]);

  const errorCount = validation.filter((v) => v.level === "error").length;
  const warnCount = validation.filter((v) => v.level === "warn").length;

  return (
    <ValidationPanel
      validation={validation}
      onJump={setActiveSection}
      errorCount={errorCount}
      warnCount={warnCount}
      mode={draft.policy.mode}
      rollout={draft.policy.rollout}
      action={draft.enforcement.action}
      scoreImpact={draft.enforcement.score_impact}
    />
  );
}
