import type { ReactNode } from "react";
import type { IconName } from "@/components/ui/icon";

/** Where a panel docks within the builder workspace. */
export type PanelSlot = "section" | "left" | "right";

/**
 * A single declarative panel definition. The registry of these (see
 * `panels/registry.tsx`) is the one source of truth for the builder workspace:
 * the FlexLayout model, the `factory` that renders tab bodies, the sections
 * rail, and the contextual reveal behavior all derive from it. Add one entry
 * and the panel shows up everywhere — no parallel lists to keep in sync.
 *
 * Panels are plain components that read the live rule/section state from the
 * store themselves. The *contextual* part of the API is declarative:
 * `relevantSections` drives where an aux panel is offered, and
 * `pickBorderSelection` (in the registry) turns that into auto-reveal.
 */
export interface BuilderPanelDef {
  /** Stable id — also the FlexLayout tab id and, for sections, the `activeSection` value. */
  id: string;
  /** Human label shown on the tab strip and in the rail. */
  title: string;
  /** Optional icon (rail + tab). */
  icon?: IconName;
  /** Docking slot: `section` panels fill the main tabset; `left`/`right` dock as border panels. */
  slot: PanelSlot;
  /** For section panels: marks the primary ("★") section in the rail. */
  primary?: boolean;
  /**
   * Sections in which an aux (left/right) panel is relevant. When the active
   * section is not listed, the border auto-reveals a more relevant sibling and
   * this panel renders a contextual hint instead of its full body.
   * `undefined` = relevant in every section.
   */
  relevantSections?: string[];
  /**
   * For aux panels with `relevantSections`: when true, the panel disappears
   * from the tab strip outside those sections instead of rendering a hint. The
   * tab node stays in the layout model, so switching back can restore its live
   * component state without re-adding the panel.
   */
  hideWhenIrrelevant?: boolean;
  /**
   * Whether the user can dismiss the panel from view — shows a close button on
   * its tab, and it can be brought back from the Panels menu. Defaults to true.
   */
  closable?: boolean;
  /**
   * Whether the panel is present in a fresh default layout. Set `false` for
   * opt-in panels the user turns on from the Panels menu. Defaults to `true`.
   */
  defaultOpen?: boolean;
  /** Renders the panel body. Panels subscribe to the store for their own data. */
  render: () => ReactNode;
}
