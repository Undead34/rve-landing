"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Actions, BorderNode, DockLocation, Layout, Model, TabNode, TabSetNode } from "flexlayout-react";
import { useHotkeys } from "react-hotkeys-hook";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRuleStore } from "@/lib/stores/rule-store";
import { SectionsRailPanel } from "./sections-rail-panel";
import { SectionContentPanel } from "./section-content-panel";
import { FieldLibrarySidebar } from "./field-library-sidebar";
import { ValidationPanel } from "./validation-panel";

const DEFAULT_LAYOUT = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableMaximize: false,
    tabSetEnableSingleTabStretch: true,
    enableEdgeDock: true,
    enableRotateBorderIcons: false,
  },
  borders: [
    {
      type: "border" as const,
      location: "left" as const,
      id: "border_left",
      size: 200,
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
      ],
    },
    {
      type: "border" as const,
      location: "right" as const,
      size: 300,
      selected: 0,
      enableAutoHide: true,
      enableDrop: true,
      children: [
        {
          type: "tab" as const,
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
        weight: 100,
        selected: 0,
        enableTabStrip: false,
        enableSingleTabStretch: true,
        enableDivide: true,
        children: [
          {
            type: "tab" as const,
            name: "Section Content",
            component: "section-content",
            enableClose: false,
            enableRenderOnDemand: false,
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

  const factory = useCallback((node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "sections":
        return <SectionsRailPanel />;
      case "section-content":
        return <SectionContentPanel />;
      case "field-library":
        return <FieldLibrarySidebar />;
      case "validation":
        return <ValidationPanelWrapper />;
      default:
        return null;
    }
  }, []);

  const activeSection = useRuleStore((s) => s.activeSection);
  const sections = ["metadata", "scope", "policy", "conditions", "consequence"];

  useEffect(() => {
    try {
      const fieldLibraryNode = model.getNodeById("field-library");
      console.log("[FieldLibrary Debug] useEffect activeSection:", activeSection, "nodeExists:", !!fieldLibraryNode);
      if (activeSection === "conditions") {
        if (!fieldLibraryNode) {
          let parentId = "border_left";
          let index = -1;

          if (typeof window !== "undefined") {
            const savedPos = localStorage.getItem("rve-platform:field-library-position");
            console.log("[FieldLibrary Debug] read savedPos:", savedPos);
            if (savedPos) {
              try {
                const parsed = JSON.parse(savedPos);
                const parentNode = model.getNodeById(parsed.parentId);
                console.log("[FieldLibrary Debug] parsed parentId:", parsed.parentId, "parentNodeExists:", !!parentNode);
                if (parsed.parentId && parentNode) {
                  parentId = parsed.parentId;
                  index = typeof parsed.index === "number" ? parsed.index : -1;
                }
              } catch (e) {
                console.warn("Failed to parse field-library position:", e);
              }
            }
          }

          console.log("[FieldLibrary Debug] Adding node to parentId:", parentId, "at index:", index);
          model.doAction(
            Actions.addNode(
              {
                type: "tab",
                id: "field-library",
                name: "Field Library",
                component: "field-library",
                enableClose: false,
              },
              parentId,
              DockLocation.CENTER,
              index
            )
          );
        }
        const updatedFieldLibraryNode = model.getNodeById("field-library");
        if (updatedFieldLibraryNode) {
          const parent = updatedFieldLibraryNode.getParent() as BorderNode | TabSetNode | null;
          if (parent && "getSelectedNode" in parent && (parent as BorderNode | TabSetNode).getSelectedNode() !== updatedFieldLibraryNode) {
            model.doAction(Actions.selectTab("field-library"));
          }
        }
      } else {
        if (fieldLibraryNode) {
          const parent = fieldLibraryNode.getParent();
          if (parent) {
            const parentId = parent.getId();
            const index = parent.getChildren().indexOf(fieldLibraryNode);
            console.log("[FieldLibrary Debug] Deleting node. Saving position:", { parentId, index });
            localStorage.setItem(
              "rve-platform:field-library-position",
              JSON.stringify({ parentId, index })
            );
          }
          model.doAction(Actions.deleteTab("field-library"));
        }
        const sectionsNode = model.getNodeById("sections");
        if (sectionsNode) {
          const parent = sectionsNode.getParent() as BorderNode | TabSetNode | null;
          if (parent && "getSelectedNode" in parent && (parent as BorderNode | TabSetNode).getSelectedNode() !== sectionsNode) {
            model.doAction(Actions.selectTab("sections"));
          }
        }
      }
    } catch (e) {
      console.warn("Could not auto-switch builder tab:", e);
    }
  }, [activeSection, model]);

  useHotkeys(
    "alt+shift+left,alt+shift+h",
    () => {
      const idx = sections.indexOf(activeSection);
      if (idx > 0) useRuleStore.getState().setActiveSection(sections[idx - 1]);
    },
    { enableOnFormTags: true },
    [activeSection, sections]
  );

  useHotkeys(
    "alt+shift+right,alt+shift+l",
    () => {
      const idx = sections.indexOf(activeSection);
      if (idx < sections.length - 1)
        useRuleStore.getState().setActiveSection(sections[idx + 1]);
    },
    { enableOnFormTags: true },
    [activeSection, sections]
  );

  const handleModelChange = useCallback((model: Model) => {
    try {
      const json = model.toJson();
      localStorage.setItem("rve-platform:builder-layout", JSON.stringify(json));

      const fieldLibraryNode = model.getNodeById("field-library");
      if (fieldLibraryNode) {
        const parent = fieldLibraryNode.getParent();
        if (parent) {
          const parentId = parent.getId();
          const index = parent.getChildren().indexOf(fieldLibraryNode);
          console.log("[FieldLibrary Debug] handleModelChange. Saving position:", { parentId, index });
          localStorage.setItem(
            "rve-platform:field-library-position",
            JSON.stringify({ parentId, index })
          );
        }
      }
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
