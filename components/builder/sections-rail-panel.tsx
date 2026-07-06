"use client";

import { Icon } from "../ui/icon";
import type { IconName } from "../ui/icon";
import { useRuleStore } from "@/lib/stores/rule-store";
import { SECTION_META } from "./panels/sections";

/** Planned rail actions, not wired up yet — rendered disabled so they don't
 *  masquerade as working buttons. */
const PLACEHOLDER_ACTIONS: Array<{ icon: IconName; label: string }> = [
  { icon: "play", label: "Test in console" },
  { icon: "history", label: "Version history" },
  { icon: "copy", label: "Clone rule" },
];

export function SectionsRailPanel() {
  const activeSection = useRuleStore((s) => s.activeSection);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  return (
    <div className="flex min-h-0 flex-col h-full bg-(--bg-elev)">
      <div className="px-3 pt-3 pb-2 text-[11px] font-medium text-(--fg-subtle) uppercase tracking-[0.06em]">
        Rule sections
      </div>
      <nav className="flex flex-col gap-px px-2" aria-label="Rule sections">
        {SECTION_META.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              aria-current={isActive ? "true" : undefined}
              className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[13px] cursor-pointer select-none ${
                isActive
                  ? "bg-(--bg-active) font-medium text-(--fg)"
                  : "text-(--fg-muted) hover:bg-(--bg-hover)"
              }`}
            >
              <Icon name={s.icon} size={14} />
              <span>{s.title}</span>
              {s.primary && (
                <span className="ml-auto text-[10px] text-(--fg-subtle)">
                  ★
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 my-3 h-px bg-(--border-faint)" />

      <div className="px-3 pb-2 text-[11px] font-medium text-(--fg-subtle) uppercase tracking-[0.06em]">
        Actions
      </div>
      <div className="flex flex-col gap-px px-2">
        {PLACEHOLDER_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled
            title="Not available yet"
            className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[13px] text-(--fg-muted) opacity-50 select-none cursor-not-allowed"
          >
            <Icon name={a.icon} size={14} />
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
