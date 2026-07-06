"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Actions,
  BorderNode,
  Layout,
  Model,
  TabNode,
  TabSetNode,
} from "flexlayout-react";
import type { ITabSetRenderValues } from "flexlayout-react";
import { useHotkeys } from "react-hotkeys-hook";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRuleStore } from "@/lib/stores/rule-store";
import {
  buildDefaultLayout,
  BUILDER_PANELS,
  getPanel,
  isPanelContextHidden,
  PANEL_IDS,
  pickBorderSelection,
} from "./panels/registry";
import { useBuilderPanels } from "./panels/use-builder-panels";
import { useSectionTabSync } from "./panels/use-section-sync";
import { EmptyTabset } from "./panels/empty-tabset";
import { PanelsMenuButton } from "./panels/panels-menu";
import {
  browserStorage,
  createLayoutStore,
  memoryStorage,
} from "./panels/layout-store";
import { SECTION_IDS } from "./panels/sections";

const CONTEXT_HIDDEN_TAB_CLASS = "rve-context-hidden-tab";
const EMPTY_TABSTRIP_CLASS = "rve-empty-tabstrip";

function setClassToken(
  className: string | undefined,
  token: string,
  enabled: boolean,
): string | undefined {
  const tokens = new Set(className?.split(/\s+/).filter(Boolean) ?? []);

  if (enabled) {
    tokens.add(token);
  } else {
    tokens.delete(token);
  }

  return tokens.size > 0 ? [...tokens].join(" ") : undefined;
}

/** Selects a tab in a border, but only when it isn't already the selected one
 *  (FlexLayout's SELECT_TAB toggles borders closed, so a blind dispatch could
 *  collapse a panel we mean to reveal). */
function selectBorderTab(model: Model, tabId: string) {
  const node = model.getNodeById(tabId);
  if (!node) return;
  const parent = node.getParent();
  if (parent instanceof BorderNode) {
    const pos = parent.getChildren().indexOf(node);
    if (parent.getSelected() !== pos) {
      model.doAction(Actions.selectTab(tabId));
    }
  }
}

/** Applies the presentation-only model attributes that depend on current
 *  state: hides context-irrelevant border tabs and marks the main tabstrip
 *  when it has no tabs. Idempotent — dispatches only on actual change. */
function syncLayoutChrome(model: Model, activeSection: string) {
  for (const panel of BUILDER_PANELS) {
    if (panel.slot === "section") continue;

    const node = model.getNodeById(panel.id);
    if (!(node instanceof TabNode)) continue;

    const nextClassName = setClassToken(
      node.getClassName(),
      CONTEXT_HIDDEN_TAB_CLASS,
      isPanelContextHidden(panel.id, activeSection),
    );

    if (nextClassName !== node.getClassName()) {
      model.doAction(
        Actions.updateNodeAttributes(panel.id, { className: nextClassName }),
      );
    }
  }

  const mainTabset = model.getFirstTabSet();
  if (!(mainTabset instanceof TabSetNode)) return;

  const nextClassName = setClassToken(
    mainTabset.getClassNameTabStrip(),
    EMPTY_TABSTRIP_CLASS,
    mainTabset.getChildren().length === 0,
  );

  if (nextClassName !== mainTabset.getClassNameTabStrip()) {
    model.doAction(
      Actions.updateNodeAttributes(mainTabset.getId(), {
        classNameTabStrip: nextClassName,
      }),
    );
  }
}

export function BuilderLayout() {
  // Persistence is owned by an injectable store: validated restore, versioned
  // + debounced save, storage backend swappable (real localStorage here, a
  // memory shim on SSR/tests). The initializer runs once per mount.
  const [store] = useState(() =>
    createLayoutStore(browserStorage() ?? memoryStorage(), {
      knownPanelIds: PANEL_IDS,
    }),
  );

  // The FlexLayout model is a mutable object created once per mount. React
  // can't observe it, so every mutation bumps `layoutRevision` (see
  // handleModelChange) and derived code keys off that counter.
  const [model] = useState(() => store.load(buildDefaultLayout));
  const [layoutRevision, setLayoutRevision] = useState(0);

  const activeSection = useRuleStore((s) => s.activeSection);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  // All activeSection ↔ FlexLayout selection syncing lives in this hook.
  const { onAction } = useSectionTabSync(model, layoutRevision);

  const panels = useBuilderPanels(
    model,
    activeSection,
    layoutRevision,
    setActiveSection,
  );

  // Persist the last layout edit before it can be lost. Component unmount
  // only covers in-app navigation — a hard reload or tab close tears down
  // the page before React's cleanup is guaranteed to run, so a debounced
  // save still pending at that moment would vanish. `pagehide` and
  // `visibilitychange` (backgrounding, closing, reloading) catch that.
  useEffect(() => {
    const flush = () => store.flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
      store.flush();
    };
  }, [store]);

  // Render tab bodies straight from the registry — one lookup by id.
  const factory = useCallback((node: TabNode) => {
    const component = node.getComponent();
    const panel = component ? getPanel(component) : undefined;
    return panel ? panel.render() : null;
  }, []);

  // Chrome reacts to both section changes and layout mutations (a re-added
  // tab needs its hidden-class re-applied; an emptied tabset its marker).
  useEffect(() => {
    syncLayoutChrome(model, activeSection);
  }, [layoutRevision, activeSection, model]);

  // Context-aware panels: reveal each border's most relevant tab for the
  // active section (Field Library while editing Conditions, the Sections rail
  // otherwise). Runs only on section change, so manual tab picks stick.
  useEffect(() => {
    for (const slot of ["left", "right"] as const) {
      const tabId = pickBorderSelection(slot, activeSection);
      if (tabId) selectBorderTab(model, tabId);
    }
  }, [activeSection, model]);

  const stepSection = useCallback((delta: -1 | 1) => {
    const state = useRuleStore.getState();
    const next = SECTION_IDS[SECTION_IDS.indexOf(state.activeSection) + delta];
    if (next) state.setActiveSection(next);
  }, []);

  useHotkeys(
    "alt+shift+left,alt+shift+h",
    () => stepSection(-1),
    { enableOnFormTags: true },
    [stepSection],
  );

  useHotkeys(
    "alt+shift+right,alt+shift+l",
    () => stepSection(1),
    { enableOnFormTags: true },
    [stepSection],
  );

  const handleModelChange = useCallback(
    (next: Model) => {
      // Revision bumps immediately (keeps derived state in sync); the write
      // itself is debounced inside the store.
      setLayoutRevision((r) => r + 1);
      store.save(next);
    },
    [store],
  );

  // Keep Panels in the main tabset toolbar when there are visible tabs; the
  // empty placeholder renders its own centered action instead.
  const handleRenderTabSet = useCallback(
    (node: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
      if (
        node instanceof TabSetNode &&
        node.getId() === model.getFirstTabSet()?.getId() &&
        node.getChildren().length > 0
      ) {
        renderValues.buttons.push(
          <PanelsMenuButton key="rve-panels-menu" controller={panels} />,
        );
      }
    },
    [model, panels],
  );

  const handleTabSetPlaceHolder = useCallback(
    (node: TabSetNode) => {
      if (node.getId() !== model.getFirstTabSet()?.getId()) return null;
      return <EmptyTabset controller={panels} />;
    },
    [model, panels],
  );

  return (
    <div className="flex-1 min-h-0 min-w-0 relative" style={{ width: "100%" }}>
      <DndProvider backend={HTML5Backend}>
        <Layout
          model={model}
          factory={factory}
          onAction={onAction}
          classNameMapper={(cls) => cls}
          onModelChange={handleModelChange}
          onRenderTabSet={handleRenderTabSet}
          onTabSetPlaceHolder={handleTabSetPlaceHolder}
        />
      </DndProvider>
    </div>
  );
}
