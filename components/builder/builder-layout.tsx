"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  buildDefaultLayout,
  BUILDER_PANELS,
  getPanel,
  isPanelContextHidden,
  PANEL_IDS,
  pickBorderSelection,
} from "./panels/registry";
import { useBuilderPanels } from "./panels/use-builder-panels";
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

  const [model] = useState(() => store.load(buildDefaultLayout));
  // Bumped on every model mutation so the panels controller re-reads visibility.
  const [layoutRevision, setLayoutRevision] = useState(0);

  const activeSection = useRuleStore((s) => s.activeSection);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  const panels = useBuilderPanels(model, activeSection);

  // Persist the last layout edit when the builder unmounts.
  useEffect(() => () => store.flush(), [store]);

  // Render tab bodies straight from the registry — one lookup by id.
  const factory = useCallback((node: TabNode) => {
    const component = node.getComponent();
    const panel = component ? getPanel(component) : undefined;
    return panel ? panel.render() : null;
  }, []);

  // Sync activeSection → the selected tab in the main tabset.
  useEffect(() => {
    try {
      const node = model.getNodeById(activeSection);
      if (node) {
        const parent = node.getParent() as BorderNode | TabSetNode | null;
        if (
          parent &&
          "getSelectedNode" in parent &&
          (parent as BorderNode | TabSetNode).getSelectedNode() !== node
        ) {
          model.doAction(Actions.selectTab(activeSection));
        }
      }
    } catch (e) {
      console.warn("Could not sync activeSection to FlexLayout:", e);
    }
  }, [activeSection, model]);

  // Context-aware panels: reveal each border's most relevant tab for the
  // active section (Field Library while editing Conditions, the Sections rail
  // otherwise). Runs only on section change, so manual tab picks stick.
  useEffect(() => {
    syncLayoutChrome(model, activeSection);

    (["left", "right"] as const).forEach((slot) => {
      const tabId = pickBorderSelection(slot, activeSection);
      if (tabId) selectBorderTab(model, tabId);
    });
  }, [activeSection, model]);

  useEffect(() => {
    syncLayoutChrome(model, activeSection);
  }, [layoutRevision, activeSection, model]);

  // Explicit "jump to this tab" requests (rail clicks, validation jumps).
  useEffect(() => {
    const handleSelectTab = (e: Event) => {
      const { tabId } = (e as CustomEvent<{ tabId: string }>).detail;
      try {
        if (model.getNodeById(tabId)) {
          model.doAction(Actions.selectTab(tabId));
        }
      } catch (err) {
        console.warn("Failed to select tab in FlexLayout:", tabId, err);
      }
    };
    window.addEventListener("rve-select-tab", handleSelectTab);
    return () => window.removeEventListener("rve-select-tab", handleSelectTab);
  }, [model]);

  // Sync FlexLayout tab selections back into the store.
  const handleAction = useCallback(
    (action: Action): Action | undefined => {
      if (action.type === Actions.SELECT_TAB) {
        const tabId = action.data.tabNode;
        if (SECTION_IDS.includes(tabId)) {
          setActiveSection(tabId);
        }
      }
      return action;
    },
    [setActiveSection],
  );

  // When the active section's tab is closed, follow the tabset's new selection.
  useEffect(() => {
    if (model.getNodeById(activeSection)) return;
    const tabset = model.getActiveTabset() ?? model.getFirstTabSet();
    const selectedId = tabset?.getSelectedNode()?.getId();
    if (selectedId && SECTION_IDS.includes(selectedId)) {
      setActiveSection(selectedId);
    }
  }, [layoutRevision, activeSection, model, setActiveSection]);

  useHotkeys(
    "alt+shift+left,alt+shift+h",
    () => {
      const idx = SECTION_IDS.indexOf(activeSection);
      if (idx > 0) setActiveSection(SECTION_IDS[idx - 1]);
    },
    { enableOnFormTags: true },
    [activeSection],
  );

  useHotkeys(
    "alt+shift+right,alt+shift+l",
    () => {
      const idx = SECTION_IDS.indexOf(activeSection);
      if (idx < SECTION_IDS.length - 1) setActiveSection(SECTION_IDS[idx + 1]);
    },
    { enableOnFormTags: true },
    [activeSection],
  );

  const handleModelChange = useCallback(
    (next: Model) => {
      // Revision bumps immediately (keeps the Panels menu in sync); the write
      // itself is debounced inside the store.
      setLayoutRevision((r) => r + 1);
      store.save(next);
    },
    [store],
  );

  return (
    <div className="flex-1 min-h-0 min-w-0 relative" style={{ width: "100%" }}>
      <DndProvider backend={HTML5Backend}>
        <Layout
          model={model}
          factory={factory}
          onAction={handleAction}
          classNameMapper={(cls) => cls}
          onModelChange={handleModelChange}
          onRenderTabSet={(node, renderValues) => {
            // Keep Panels in the main tabset toolbar when there are visible
            // tabs; the empty placeholder renders its own centered action.
            if (
              node instanceof TabSetNode &&
              node.getId() === model.getFirstTabSet()?.getId() &&
              node.getChildren().length > 0
            ) {
              renderValues.buttons.push(
                <PanelsMenuButton key="rve-panels-menu" controller={panels} />,
              );
            }
          }}
          onTabSetPlaceHolder={(node) => {
            if (node.getId() !== model.getFirstTabSet()?.getId()) return null;
            return <EmptyTabset controller={panels} />;
          }}
        />
      </DndProvider>
    </div>
  );
}
