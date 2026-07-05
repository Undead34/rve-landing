"use client";

import type { ReactNode } from "react";
import type { IJsonModel, IJsonTabNode } from "flexlayout-react";
import { useRuleStore } from "@/lib/stores/rule-store";
import { useRuleValidation } from "@/lib/hooks/useRuleValidation";

import { SectionsRailPanel } from "../sections-rail-panel";
import { FieldLibrarySidebar } from "../field-library-sidebar";
import { ValidationPanel } from "../validation-panel";
import { MetadataSection } from "../metadata-section";
import { ScopeSection } from "../scope-section";
import { PolicySection } from "../policy-section";
import { ConsequenceSection } from "../consequence-section";
import { ConditionsSection, ConditionsSummary } from "../conditions-section";

import type { BuilderPanelDef } from "./types";
import { SECTION_META } from "./sections";

/* ─────────────────────────── Connected panels ───────────────────────────
   Each panel is a self-contained component: it subscribes to exactly the
   slice of the rule store it needs. Nothing is prop-drilled from the layout,
   so a panel stays live regardless of how FlexLayout memoizes its portal. */

function MetadataPanel() {
  const meta = useRuleStore((s) => s.draft.identity);
  const setIdentity = useRuleStore((s) => s.setIdentity);
  return (
    <div className="p-6 overflow-auto h-full">
      <MetadataSection meta={meta} onChange={setIdentity} />
    </div>
  );
}

function ScopePanel() {
  const channels = useRuleStore((s) => s.draft.channels);
  const setChannels = useRuleStore((s) => s.setChannels);
  return (
    <div className="p-6 overflow-auto h-full">
      <ScopeSection channels={channels} onChange={setChannels} />
    </div>
  );
}

function PolicyPanel() {
  const policy = useRuleStore((s) => s.draft.policy);
  const setPolicy = useRuleStore((s) => s.setPolicy);
  return (
    <div className="p-6 overflow-auto h-full">
      <PolicySection policy={policy} onChange={setPolicy} />
    </div>
  );
}

function ConditionsPanel() {
  const tree = useRuleStore((s) => s.draft.conditionTree);
  const setConditionTree = useRuleStore((s) => s.setConditionTree);
  return <ConditionsSection tree={tree} onChange={setConditionTree} />;
}

function ConsequencePanel() {
  const enforcement = useRuleStore((s) => s.draft.enforcement);
  const setEnforcement = useRuleStore((s) => s.setEnforcement);
  return (
    <div className="p-6 overflow-auto h-full">
      <ConsequenceSection consequence={enforcement} onChange={setEnforcement} />
    </div>
  );
}

function SummaryPanel() {
  const tree = useRuleStore((s) => s.draft.conditionTree);
  return (
    <div className="p-6 overflow-auto h-full">
      <ConditionsSummary tree={tree} />
    </div>
  );
}

const SECTION_RENDERERS: Record<string, () => ReactNode> = {
  metadata: () => <MetadataPanel />,
  scope: () => <ScopePanel />,
  policy: () => <PolicyPanel />,
  conditions: () => <ConditionsPanel />,
  consequence: () => <ConsequencePanel />,
  summary: () => <SummaryPanel />,
};

/** Field Library, aware of whether the active section can receive dropped fields. */
function FieldLibraryPanel() {
  const activeSection = useRuleStore((s) => s.activeSection);
  return (
    <FieldLibrarySidebar
      isRelevant={isPanelRelevant("field-library", activeSection)}
    />
  );
}

/** Live validation, scoped to the section you're currently editing. */
function ValidationPanelConnected() {
  const activeSection = useRuleStore((s) => s.activeSection);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);
  const mode = useRuleStore((s) => s.draft.policy.mode);
  const rollout = useRuleStore((s) => s.draft.policy.rollout);
  const action = useRuleStore((s) => s.draft.enforcement.action);
  const scoreImpact = useRuleStore((s) => s.draft.enforcement.score_impact);
  const { messages, errorCount, warnCount } = useRuleValidation();

  return (
    <ValidationPanel
      validation={messages}
      onJump={setActiveSection}
      errorCount={errorCount}
      warnCount={warnCount}
      mode={mode}
      rollout={rollout}
      action={action}
      scoreImpact={scoreImpact}
      activeSection={activeSection}
    />
  );
}

/* ────────────────────────────── The registry ────────────────────────────── */

/**
 * The one source of truth for the builder workspace. Section panels are
 * generated from `SECTION_META` (shared with the rail); the auxiliary panels
 * dock to the borders. `field-library` is only relevant while editing
 * conditions, and hides from the border tab strip outside that section.
 */
export const BUILDER_PANELS: BuilderPanelDef[] = [
  {
    id: "sections",
    title: "Sections",
    slot: "left",
    render: () => <SectionsRailPanel />,
  },
  {
    id: "field-library",
    title: "Field Library",
    slot: "left",
    relevantSections: ["conditions"],
    hideWhenIrrelevant: true,
    render: () => <FieldLibraryPanel />,
  },
  ...SECTION_META.map(
    (s): BuilderPanelDef => ({
      id: s.id,
      title: s.title,
      icon: s.icon,
      slot: "section",
      primary: s.primary,
      render: SECTION_RENDERERS[s.id],
    }),
  ),
  {
    id: "validation",
    title: "Validation",
    slot: "right",
    render: () => <ValidationPanelConnected />,
  },
];

const PANEL_BY_ID = new Map(BUILDER_PANELS.map((p) => [p.id, p]));

/** All section panels, in rail/tab-strip order. */
export const SECTION_PANELS = BUILDER_PANELS.filter(
  (p) => p.slot === "section",
);

/** Every registered panel id — the set of tab ids the factory can render. */
export const PANEL_IDS = new Set(BUILDER_PANELS.map((p) => p.id));

export function getPanel(id: string): BuilderPanelDef | undefined {
  return PANEL_BY_ID.get(id);
}

/** Whether a panel can be dismissed from the layout. */
export function isPanelClosable(panel: BuilderPanelDef): boolean {
  return panel.closable ?? true;
}

/** Whether a panel is present in a fresh default layout. */
export function isPanelDefaultOpen(panel: BuilderPanelDef): boolean {
  return panel.defaultOpen ?? true;
}

/** Whether a panel is relevant to a section (aux panels without a scope are always relevant). */
export function isPanelRelevant(
  panelId: string,
  activeSection: string,
): boolean {
  const panel = PANEL_BY_ID.get(panelId);
  if (!panel?.relevantSections?.length) return true;
  return panel.relevantSections.includes(activeSection);
}

/** Whether a panel should disappear from the visible tab strip in this section. */
export function isPanelContextHidden(
  panelId: string,
  activeSection: string,
): boolean {
  const panel = PANEL_BY_ID.get(panelId);
  if (!panel) return false;
  return Boolean(
    panel.hideWhenIrrelevant && !isPanelRelevant(panelId, activeSection),
  );
}

/**
 * Picks which tab a border should reveal for the active section: a
 * context-specific panel wins (e.g. Field Library while in Conditions),
 * otherwise the first always-relevant panel (e.g. the Sections rail).
 */
export function pickBorderSelection(
  slot: "left" | "right",
  activeSection: string,
): string | undefined {
  const panels = BUILDER_PANELS.filter((p) => p.slot === slot);
  const contextual = panels.find((p) =>
    p.relevantSections?.includes(activeSection),
  );
  if (contextual) return contextual.id;
  return panels.find((p) => !p.relevantSections)?.id;
}

/* ─────────────────────── FlexLayout model generation ─────────────────────── */

/** The FlexLayout tab JSON for a panel — used both for the default layout and
 *  when re-adding a panel from the Panels menu, so behavior stays identical. */
export function panelTabJson(p: BuilderPanelDef): IJsonTabNode {
  return {
    type: "tab",
    id: p.id,
    name: p.title,
    component: p.id,
    enableClose: isPanelClosable(p),
    // Border panels stay mounted (drag sources / live status); section tabs
    // render on demand as the user switches between them.
    ...(p.slot === "section" ? {} : { enableRenderOnDemand: false }),
  };
}

/** Builds the default FlexLayout model straight from the registry. */
export function buildDefaultLayout(): IJsonModel {
  const left = BUILDER_PANELS.filter(
    (p) => p.slot === "left" && isPanelDefaultOpen(p),
  );
  const right = BUILDER_PANELS.filter(
    (p) => p.slot === "right" && isPanelDefaultOpen(p),
  );
  const conditionsIndex = Math.max(
    0,
    SECTION_PANELS.findIndex((p) => p.id === "conditions"),
  );

  return {
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
        type: "border",
        location: "left",
        size: 240,
        selected: 0,
        enableAutoHide: true,
        enableDrop: true,
        children: left.map(panelTabJson),
      },
      {
        type: "border",
        location: "right",
        size: 320,
        selected: 0,
        enableAutoHide: true,
        enableDrop: true,
        children: right.map(panelTabJson),
      },
    ],
    layout: {
      type: "row",
      children: [
        {
          type: "tabset",
          id: "main_tabset",
          weight: 100,
          selected: conditionsIndex,
          children: SECTION_PANELS.map(panelTabJson),
        },
      ],
    },
  };
}
