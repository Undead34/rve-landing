"use client";

import { useCallback, useMemo } from "react";
import { Actions, DockLocation, Model } from "flexlayout-react";
import type { PanelSlot } from "./types";
import {
  BUILDER_PANELS,
  getPanel,
  isPanelClosable,
  isPanelContextHidden,
  panelTabJson,
} from "./registry";

export interface PanelToggle {
  id: string;
  title: string;
  slot: PanelSlot;
  visible: boolean;
}

export interface BuilderPanelsController {
  /** The dismissible panels and their current visibility, in registry order. */
  toggles: PanelToggle[];
  showPanel: (id: string) => void;
  hidePanel: (id: string) => void;
  togglePanel: (id: string) => void;
}

/**
 * The visibility half of the panels API: a thin controller over the FlexLayout
 * model that shows/hides dismissible panels. Hiding removes the tab; showing
 * re-docks it to its slot's border (or the main tabset for sections) using the
 * very same JSON the default layout uses, so a restored panel behaves exactly
 * as it did before.
 *
 * `layoutRevision` must change whenever the model mutates (wire it to
 * `onModelChange`) — it is what invalidates the memoized `toggles`, since the
 * FlexLayout model is mutable and can't be observed by React directly.
 *
 * `onSectionShown` fires after a *section* panel is re-added. Programmatic
 * `model.doAction` calls bypass `<Layout onAction>`, so without this callback
 * the store would never learn that the re-added tab is now the selected one.
 */
export function useBuilderPanels(
  model: Model,
  activeSection: string,
  layoutRevision: number,
  onSectionShown?: (id: string) => void,
): BuilderPanelsController {
  const toggles = useMemo(
    () =>
      BUILDER_PANELS.filter(isPanelClosable)
        .filter((p) => !isPanelContextHidden(p.id, activeSection))
        .map((p) => ({
          id: p.id,
          title: p.title,
          slot: p.slot,
          visible: model.getNodeById(p.id) !== undefined,
        })),
    // layoutRevision stands in for the mutable model's contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, activeSection, layoutRevision],
  );

  const hidePanel = useCallback(
    (id: string) => {
      if (!model.getNodeById(id)) return;
      model.doAction(Actions.deleteTab(id));
    },
    [model],
  );

  const showPanel = useCallback(
    (id: string) => {
      if (model.getNodeById(id)) return; // already visible
      const panel = getPanel(id);
      if (!panel) return;

      if (panel.slot === "section") {
        // Re-dock the section into a live tabset in the main area.
        const tabset = model.getActiveTabset() ?? model.getFirstTabSet();
        if (!tabset) return;
        model.doAction(
          Actions.addTab(
            panelTabJson(panel),
            tabset.getId(),
            DockLocation.CENTER,
            -1,
            true,
          ),
        );
        onSectionShown?.(id);
        return;
      }

      const border = model
        .getBorderSet()
        .getBorders()
        .find((b) => b.getLocation().getName() === panel.slot);
      if (!border) return;
      model.doAction(
        Actions.addTab(
          panelTabJson(panel),
          border.getId(),
          DockLocation.CENTER,
          -1,
          true,
        ),
      );
    },
    [model, onSectionShown],
  );

  const togglePanel = useCallback(
    (id: string) => {
      if (model.getNodeById(id)) hidePanel(id);
      else showPanel(id);
    },
    [model, hidePanel, showPanel],
  );

  return useMemo(
    () => ({ toggles, showPanel, hidePanel, togglePanel }),
    [toggles, showPanel, hidePanel, togglePanel],
  );
}
