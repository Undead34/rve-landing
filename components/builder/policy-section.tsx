import { Field } from "../ui/field";
import { Input } from "../ui/input";

type RuleMode = "staged" | "active" | "suspended" | "deactivated";

export interface RulePolicy {
  mode: RuleMode;
  rollout: number;
  schedule_from: string;
  schedule_to: string;
}

interface PolicySectionProps {
  policy: RulePolicy;
  onChange: (policy: RulePolicy) => void;
}

const modes = [
  { value: "staged" as const, desc: "Shadow-eval, no enforcement" },
  { value: "active" as const, desc: "Live, enforces consequence" },
  { value: "suspended" as const, desc: "Loaded, not evaluating" },
  { value: "deactivated" as const, desc: "Off, archived" },
];

export function PolicySection({ policy, onChange }: PolicySectionProps) {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 720 }}>
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] m-0 mb-1">
          Policy
        </h2>
        <p className="text-[13px] text-(--fg-muted) m-0">
          Activation mode, schedule window, and traffic rollout.
        </p>
      </div>

      <Field label="Mode">
        <div className="grid grid-cols-4 gap-2">
          {modes.map((m) => {
            const on = policy.mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ ...policy, mode: m.value })}
                className="text-left p-3 rounded-[6px] cursor-pointer"
                style={{
                  border: `1px solid ${on ? `var(--status-${m.value})` : "var(--border)"}`,
                  background: on
                    ? `var(--status-${m.value}-bg)`
                    : "var(--bg-elev)",
                }}
              >
                <div className="flex items-center gap-[6px] mb-1">
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{ background: `var(--status-${m.value})` }}
                  />
                  <span className="font-medium text-[13px] capitalize">
                    {m.value}
                  </span>
                </div>
                <div className="text-[11px] text-(--fg-muted)">
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Rollout"
        hint="Percentage of qualifying traffic this rule will evaluate."
      >
        <div className="flex gap-4 items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={policy.rollout}
            onChange={(e) => onChange({ ...policy, rollout: +e.target.value })}
            className="flex-1"
            style={{ accentColor: "var(--fg)" }}
          />
          <div className="flex items-center gap-1">
            <Input
              className="font-mono text-right"
              style={{ width: 60 }}
              type="number"
              min="0"
              max="100"
              value={policy.rollout}
              onChange={(e) =>
                onChange({ ...policy, rollout: +e.target.value })
              }
            />
            <span className="text-(--fg-muted)">%</span>
          </div>
        </div>
      </Field>

      <Field
        label="Schedule (optional)"
        hint="If set, rule only evaluates during this window."
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-(--fg-muted) mb-[2px]">
              From
            </div>
            <Input
              className="font-mono"
              type="datetime-local"
              value={policy.schedule_from}
              onChange={(e) =>
                onChange({ ...policy, schedule_from: e.target.value })
              }
            />
          </div>
          <div>
            <div className="text-[11px] text-(--fg-muted) mb-[2px]">
              To
            </div>
            <Input
              className="font-mono"
              type="datetime-local"
              value={policy.schedule_to}
              onChange={(e) =>
                onChange({ ...policy, schedule_to: e.target.value })
              }
            />
          </div>
        </div>
      </Field>
    </div>
  );
}
