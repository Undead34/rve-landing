"use client";

import { Icon } from "../ui/icon";
import { useRuleStore } from "@/lib/stores/rule-store";

const SECTIONS = [
  { id: "metadata", label: "Metadata", icon: "info" },
  { id: "scope", label: "Scope", icon: "branch" },
  { id: "policy", label: "Policy", icon: "shield" },
  { id: "conditions", label: "Conditions", icon: "rule", primary: true },
  { id: "consequence", label: "Consequence", icon: "zap" },
];

export function SectionsRailPanel() {
  const activeSection = useRuleStore((s) => s.activeSection);
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  return (
    <div className="flex flex-col h-full bg-(--bg-elev)" style={{ minHeight: 0 }}>
      <div className="px-3 pt-3 pb-2 text-[11px] font-medium text-(--fg-subtle) uppercase tracking-[0.06em]">
        Rule sections
      </div>
      <div className="flex flex-col gap-px px-2">
        {SECTIONS.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="flex items-center gap-2.5 px-2 py-1.5 text-[13px] rounded cursor-pointer select-none"
              style={{
                color: isActive ? "var(--fg)" : "var(--fg-muted)",
                background: isActive ? "var(--bg-active)" : "transparent",
                fontWeight: isActive ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon name={s.icon as never} size={14} />
              <span>{s.label}</span>
              {s.primary && (
                <span className="ml-auto text-[10px] text-(--fg-subtle)">★</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-3 my-3 h-px bg-(--border-faint)" />

      <div className="px-3 pb-2 text-[11px] font-medium text-(--fg-subtle) uppercase tracking-[0.06em]">
        Actions
      </div>
      <div className="flex flex-col gap-px px-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5 text-[13px] text-(--fg-muted) rounded cursor-pointer select-none hover:bg-(--bg-hover) hover:text-(--fg)">
          <Icon name="play" size={14} />
          <span>Test in console</span>
        </div>
        <div className="flex items-center gap-2.5 px-2 py-1.5 text-[13px] text-(--fg-muted) rounded cursor-pointer select-none hover:bg-(--bg-hover) hover:text-(--fg)">
          <Icon name="history" size={14} />
          <span>Version history</span>
        </div>
        <div className="flex items-center gap-2.5 px-2 py-1.5 text-[13px] text-(--fg-muted) rounded cursor-pointer select-none hover:bg-(--bg-hover) hover:text-(--fg)">
          <Icon name="copy" size={14} />
          <span>Clone rule</span>
        </div>
      </div>
    </div>
  );
}
