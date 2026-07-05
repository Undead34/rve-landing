import type { IconName } from "@/components/ui/icon";

/**
 * The ordered list of editor sections. This is pure data (no components) so it
 * can be shared by both the panel registry and the sections rail without an
 * import cycle. The order here is authoritative: it drives the main tab strip,
 * the rail, and the prev/next section hotkeys.
 */
export interface SectionMeta {
  id: string;
  title: string;
  icon: IconName;
  /** Marks the primary ("★") section highlighted in the rail. */
  primary?: boolean;
}

export const SECTION_META: SectionMeta[] = [
  { id: "metadata", title: "Metadata", icon: "info" },
  { id: "scope", title: "Scope", icon: "branch" },
  { id: "policy", title: "Policy", icon: "shield" },
  { id: "conditions", title: "Conditions", icon: "rule", primary: true },
  { id: "consequence", title: "Consequence", icon: "zap" },
  { id: "summary", title: "Summary", icon: "list" },
];

export const SECTION_IDS = SECTION_META.map((s) => s.id);
