"use client";

import { useCallback, useEffect } from "react";
import { Actions, BorderNode, Model, TabSetNode } from "flexlayout-react";
import type { Action } from "flexlayout-react";
import { useRuleStore } from "@/lib/stores/rule-store";
import { SECTION_IDS } from "./sections";

/**
 * The one owner of the two-way sync between `activeSection` in the rule store
 * and the selected tab in FlexLayout. Everything that wants to navigate to a
 * section calls `setActiveSection` on the store; nothing else may dispatch
 * `Actions.selectTab` for section tabs. Three flows live here:
 *
 *   store → layout    effect keyed on `sectionNav` — the store bumps it on
 *                     every `setActiveSection` call, including re-asserts of
 *                     the current section, so an explicit "go to Conditions"
 *                     re-selects the tab even when the section didn't change
 *                     (e.g. another tab stole the tabset selection).
 *   layout → store    `onAction` — wire it to `<Layout onAction>`; when the
 *                     user picks a section tab, the store follows.
 *   tab closed        effect keyed on `layoutRevision` — when the active
 *                     section's tab no longer exists, adopt whatever section
 *                     tab the tabset selected in its place.
 */
export function useSectionTabSync(
  model: Model,
  layoutRevision: number,
): { onAction: (action: Action) => Action | undefined } {
  const activeSection = useRuleStore((s) => s.activeSection);
  const sectionNav = useRuleStore((s) => s.sectionNav);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  // store → layout
  useEffect(() => {
    const node = model.getNodeById(activeSection);
    if (!node) return;

    const parent = node.getParent();
    // Both tabsets and borders track a selected child. The guard matters for
    // borders: re-selecting a border's current tab toggles the border closed.
    if (!(parent instanceof TabSetNode) && !(parent instanceof BorderNode)) {
      return;
    }
    if (parent.getSelectedNode() === node) return;

    try {
      model.doAction(Actions.selectTab(activeSection));
    } catch (err) {
      console.warn("Could not sync activeSection to FlexLayout:", err);
    }
  }, [sectionNav, activeSection, model]);

  // tab closed → follow the tabset's replacement selection
  useEffect(() => {
    if (model.getNodeById(activeSection)) return;
    const tabset = model.getActiveTabset() ?? model.getFirstTabSet();
    const selectedId = tabset?.getSelectedNode()?.getId();
    if (selectedId && SECTION_IDS.includes(selectedId)) {
      setActiveSection(selectedId);
    }
  }, [layoutRevision, activeSection, model, setActiveSection]);

  // layout → store
  const onAction = useCallback(
    (action: Action): Action | undefined => {
      if (action.type === Actions.SELECT_TAB) {
        const tabId: unknown = action.data.tabNode;
        if (typeof tabId === "string" && SECTION_IDS.includes(tabId)) {
          setActiveSection(tabId);
        }
      }
      return action;
    },
    [setActiveSection],
  );

  return { onAction };
}
