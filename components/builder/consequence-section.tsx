import { useState } from "react";
import { Field } from "../ui/field";
import { Input, Select } from "../ui/input";
import { Icon } from "../ui/icon";
import type {
  EnforcementAction,
  EnforcementSeverity,
} from "@/lib/domain/types";

export interface Consequence {
  action: EnforcementAction;
  score_impact: number;
  severity: EnforcementSeverity;
  tags: string[];
  cooldown_seconds: number;
}

interface ConsequenceSectionProps {
  consequence: Consequence;
  onChange: (consequence: Consequence) => void;
}

const actions = [
  {
    value: "allow" as const,
    label: "Allow",
    desc: "Permit the event. No further action.",
  },
  {
    value: "review" as const,
    label: "Review",
    desc: "Send to manual review queue.",
  },
  {
    value: "block" as const,
    label: "Block",
    desc: "Reject the event. Customer is notified.",
  },
  {
    value: "tag_only" as const,
    label: "Tag only",
    desc: "Attach tags, do not change outcome.",
  },
];

export function ConsequenceSection({
  consequence,
  onChange,
}: ConsequenceSectionProps) {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 720 }}>
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] m-0 mb-1">
          Consequence
        </h2>
        <p className="text-[13px] text-[var(--fg-muted)] m-0">
          What the engine does when this rule&apos;s conditions match.
        </p>
      </div>

      <Field label="Action">
        <div className="grid grid-cols-4 gap-2">
          {actions.map((a) => {
            const on = consequence.action === a.value;
            return (
              <div
                key={a.value}
                onClick={() => onChange({ ...consequence, action: a.value })}
                className="p-3 rounded-[6px] cursor-pointer"
                style={{
                  border: `1px solid ${on ? `var(--action-${a.value})` : "var(--border)"}`,
                  background: on
                    ? `color-mix(in srgb, var(--action-${a.value}) 8%, var(--bg-elev))`
                    : "var(--bg-elev)",
                }}
              >
                <div className="flex items-center gap-[6px] mb-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: `var(--action-${a.value})` }}
                  />
                  <span className="font-medium text-[13px]">{a.label}</span>
                </div>
                <div className="text-[11px] text-[var(--fg-muted)]">
                  {a.desc}
                </div>
              </div>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Score impact"
          hint="Range 1-10. Contributes to the final decision score."
        >
          <div className="flex gap-3 items-center">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={consequence.score_impact}
              onChange={(e) =>
                onChange({ ...consequence, score_impact: +e.target.value })
              }
              className="flex-1"
              style={{ accentColor: "var(--accent)" }}
            />
            <span className="font-mono text-xl font-semibold min-w-[30px] text-right">
              {consequence.score_impact}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-[var(--fg-subtle)] mt-[2px]">
            <span>1 - low</span>
            <span>5 - medium</span>
            <span>10 - critical</span>
          </div>
        </Field>

        <Field label="Severity">
          <Select
            value={consequence.severity}
            onChange={(e) =>
              onChange({
                ...consequence,
                severity: e.target.value as EnforcementSeverity,
              })
            }
          >
            <option value="none">None</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="very_high">Very High</option>
            <option value="catastrophic">Catastrophic</option>
          </Select>
        </Field>
      </div>

      <Field
        label="Enforcement tags"
        hint="Free-form tags attached to the decision."
      >
        <TagInput
          tags={consequence.tags}
          onChange={(tags) => onChange({ ...consequence, tags: tags })}
        />
      </Field>

      <Field
        label="Cooldown"
        hint="Seconds before this rule re-fires on the same customer."
      >
        <div className="flex gap-2 items-center">
          <Input
            className="font-mono"
            style={{ width: 120 }}
            type="number"
            value={consequence.cooldown_seconds}
            onChange={(e) =>
              onChange({ ...consequence, cooldown_seconds: +e.target.value })
            }
          />
          <span className="text-[12px] text-[var(--fg-muted)]">
            seconds ({Math.floor(consequence.cooldown_seconds / 60)}m)
          </span>
        </div>
      </Field>
    </div>
  );
}

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-wrap gap-[6px] p-[6px] border border-[var(--border-strong)] rounded-[var(--radius-md)] bg-[var(--bg-elev)] min-h-[32px]">
      {tags.map((t) => (
        <span key={t} className="badge neutral mono !pr-1">
          {t}
          <button
            type="button"
            className="inline-grid place-items-center w-[14px] h-[14px] rounded-[var(--radius-sm)] cursor-pointer text-[var(--fg-muted)] bg-transparent border-none hover:bg-[var(--bg-hover)]"
            onClick={() => onChange(tags.filter((x) => x !== t))}
          >
            <Icon name="x" size={10} />
          </button>
        </span>
      ))}
      <input
        className="border-none outline-none bg-transparent text-[12px] font-mono flex-1 min-w-[80px]"
        placeholder={tags.length === 0 ? "Add tag and press Enter" : ""}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            onChange([...tags, draft.trim()]);
            setDraft("");
          }
          if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
