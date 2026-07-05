"use client";

import { useCallback } from "react";
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
 * re-docks it to its slot's border using the very same JSON the default layout
 * uses, so a restored panel behaves exactly as it did before.
 *
 * `revision` should change whenever the model mutates (wire it to
 * `onModelChange`) so `toggles` recomputes their visibility.
 */
export function useBuilderPanels(
  model: Model,
  activeSection: string,
): BuilderPanelsController {
  const toggles = BUILDER_PANELS.filter(isPanelClosable)
    .filter((p) => !isPanelContextHidden(p.id, activeSection))
    .map((p) => ({
      id: p.id,
      title: p.title,
      slot: p.slot,
      visible: model.getNodeById(p.id) !== undefined,
    }));

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
          Actions.addNode(
            panelTabJson(panel),
            tabset.getId(),
            DockLocation.CENTER,
            -1,
            true,
          ),
        );
        return;
      }

      const border = model
        .getBorderSet()
        .getBorders()
        .find((b) => b.getLocation().getName() === panel.slot);
      if (!border) return;
      model.doAction(
        Actions.addNode(
          panelTabJson(panel),
          border.getId(),
          DockLocation.CENTER,
          -1,
          true,
        ),
      );
    },
    [model],
  );

  const togglePanel = useCallback(
    (id: string) => {
      if (model.getNodeById(id)) hidePanel(id);
      else showPanel(id);
    },
    [model, hidePanel, showPanel],
  );

  return { toggles, showPanel, hidePanel, togglePanel };
}
