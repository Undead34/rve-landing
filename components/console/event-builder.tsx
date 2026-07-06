import { useState } from "react";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { Badge } from "../ui/badge";

interface RecentSim {
  id: string;
  label: string;
  outcome: string;
  score: number;
  when: string;
}

interface EventBuilderProps {
  onEvaluate: () => void;
  evaluating: boolean;
  recentSimulations: RecentSim[];
}

const sections = [
  { id: "header", label: "Header", count: 4 },
  { id: "context", label: "Context", count: 6 },
  { id: "features", label: "Features", count: 8 },
  { id: "signals", label: "Signals", count: 5 },
  { id: "payload", label: "Payload", count: 12 },
];

export function EventBuilder({
  onEvaluate,
  evaluating,
  recentSimulations,
}: EventBuilderProps) {
  const [activeSection, setActiveSection] = useState("header");

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-6 py-[14px] border-b border-(--border) bg-(--bg-elev)">
        <div>
          <h1 className="text-lg font-semibold tracking-[-0.01em] m-0">
            Decision Console
          </h1>
          <p className="text-[12px] text-(--fg-muted) m-0 mt-[2px]">
            Simulate events against the current rule set. Engine version{" "}
            <span className="font-mono">v3.4.1</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon="upload">Import event</Button>
          <Button icon="copy">Use template</Button>
          <Button
            kind="accent"
            icon="play"
            onClick={onEvaluate}
            disabled={evaluating}
          >
            {evaluating ? "Evaluating..." : "Evaluate"}
            {!evaluating && <Kbd>⌘↵</Kbd>}
          </Button>
        </div>
      </div>

      <div
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: "180px 1fr" }}
      >
        <div className="border-r border-(--border) p-3 bg-(--bg-elev) overflow-y-auto">
          <div className="text-(--fs-xs) text-(--fg-subtle) uppercase tracking-[0.06em] px-1 pb-2 font-medium">
            Event sections
          </div>
          <div className="flex flex-col gap-[2px]">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={[
                  "w-full text-left flex items-center gap-[10px] px-2 py-[6px] rounded-(--radius-sm) cursor-pointer select-none text-(--fs-md)",
                  activeSection === s.id
                    ? "bg-(--bg-active) text-(--fg) font-medium"
                    : "text-(--fg-muted) hover:bg-(--bg-hover) hover:text-(--fg)",
                ].join(" ")}
              >
                <span>{s.label}</span>
                <span className="ml-auto text-[10px] text-(--fg-subtle) font-mono">
                  {s.count}
                </span>
              </button>
            ))}
          </div>
          <div className="h-[1px] bg-(--border-faint) my-3" />
          <div className="text-(--fs-xs) text-(--fg-subtle) uppercase tracking-[0.06em] px-1 pb-2 font-medium">
            Recent simulations
          </div>
          <div className="flex flex-col gap-1">
            {recentSimulations.map((s) => (
              <div
                key={s.id}
                className="p-[6px_8px] border border-(--border-faint) rounded cursor-pointer bg-(--bg-elev)"
              >
                <div className="flex justify-between items-center gap-1">
                  <span className="font-mono text-[10px] text-(--fg-subtle)">
                    {s.id}
                  </span>
                  <Badge
                    kind={
                      s.outcome as "allow" | "review" | "block" | "tag_only"
                    }
                    dot
                  >
                    {s.outcome}
                  </Badge>
                </div>
                <div className="text-[11px] mt-1 text-(--fg-muted) leading-relaxed truncate">
                  {s.label}
                </div>
                <div className="text-[10px] text-(--fg-subtle) mt-[2px]">
                  {s.when} · score {s.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-5 px-6">
          <EventSectionForm section={activeSection} />
        </div>
      </div>
    </div>
  );
}

interface FormField {
  label: string;
  type: string;
  value: string | number;
  mono?: boolean;
  hint?: string;
  options?: string[];
}

function EventSectionForm({ section }: { section: string }) {
  const sections: Record<
    string,
    { title: string; subtitle: string; fields: FormField[] }
  > = {
    header: {
      title: "Header",
      subtitle: "Identifies the event and the channel it originates from.",
      fields: [
        {
          label: "event_id",
          type: "text",
          value: "evt_8af3b2c4d1",
          mono: true,
          hint: "Auto-generated if empty",
        },
        {
          label: "event.type",
          type: "select",
          value: "transaction",
          options: [
            "transaction",
            "login",
            "signup",
            "password_reset",
            "withdrawal",
          ],
        },
        {
          label: "event.channel",
          type: "select",
          value: "web",
          options: ["web", "mobile", "api", "branch", "atm", "callcenter"],
        },
        {
          label: "event.timestamp",
          type: "datetime",
          value: "2026-05-19T10:42:18",
          hint: "Defaults to now if omitted",
        },
      ],
    },
    context: {
      title: "Context",
      subtitle: "Customer and session context for the event.",
      fields: [
        {
          label: "customer.id",
          type: "text",
          value: "cus_94k2lf3a",
          mono: true,
        },
        { label: "customer.age_days", type: "number", value: 412 },
        {
          label: "customer.kyc_level",
          type: "select",
          value: "L2",
          options: ["L0", "L1", "L2", "L3"],
        },
        {
          label: "customer.risk_segment",
          type: "select",
          value: "medium",
          options: ["low", "medium", "high"],
        },
        {
          label: "session.id",
          type: "text",
          value: "sess_b9d31fa2",
          mono: true,
        },
        {
          label: "session.ip",
          type: "text",
          value: "85.214.132.117",
          mono: true,
        },
      ],
    },
    features: {
      title: "Features",
      subtitle: "Pre-computed numeric features. Defaults from feature service.",
      fields: [
        { label: "features.amount_zscore_7d", type: "number", value: 4.2 },
        {
          label: "features.merchant_category_risk",
          type: "number",
          value: 0.36,
        },
        { label: "features.geo_distance_km", type: "number", value: 18 },
        { label: "features.account_age_days", type: "number", value: 412 },
        { label: "features.txn_count_24h", type: "number", value: 7 },
        { label: "features.failed_attempts_1h", type: "number", value: 0 },
        { label: "features.avg_txn_amount_30d", type: "number", value: 142.5 },
        { label: "features.unique_devices_7d", type: "number", value: 2 },
      ],
    },
    signals: {
      title: "Signals",
      subtitle: "External and computed risk signals attached to the event.",
      fields: [
        {
          label: "signals.velocity_1h",
          type: "number",
          value: 6,
          hint: "⚠ Above typical threshold (5)",
        },
        { label: "signals.velocity_24h", type: "number", value: 14 },
        {
          label: "signals.device_fingerprint",
          type: "text",
          value: "fp_a8e2d4f9c1b3",
          mono: true,
        },
        { label: "signals.ip_country", type: "text", value: "NL", mono: true },
        {
          label: "signals.ip_risk_score",
          type: "number",
          value: 0.72,
          hint: "Hosting provider detected",
        },
      ],
    },
    payload: {
      title: "Payload",
      subtitle: "Free-form payload. Schema depends on event.type.",
      fields: [
        { label: "payment.amount", type: "number", value: 248.5 },
        { label: "payment.currency", type: "text", value: "USD", mono: true },
        {
          label: "payment.method",
          type: "select",
          value: "card",
          options: ["card", "ach", "wire", "crypto", "pix"],
        },
        {
          label: "payment.card_bin",
          type: "text",
          value: "411111",
          mono: true,
        },
        {
          label: "payment.card_country",
          type: "text",
          value: "US",
          mono: true,
        },
        {
          label: "payment.merchant_id",
          type: "text",
          value: "mrch_8a3df21",
          mono: true,
        },
        {
          label: "payment.merchant_name",
          type: "text",
          value: "OnlineRetailer Inc.",
        },
        {
          label: "payment.merchant_mcc",
          type: "text",
          value: "5732",
          mono: true,
          hint: "Electronics",
        },
      ],
    },
  };

  const s = sections[section];
  if (!s) return null;

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 720 }}>
      <div>
        <h2 className="text-base font-semibold m-0 mb-1">{s.title}</h2>
        <p className="text-[12px] text-(--fg-muted) m-0">{s.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {s.fields.map((f: FormField) => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="font-mono text-[11px] text-(--fg)">
              {f.label}
            </label>
            {f.type === "select" ? (
              <select
                className="px-[8px] py-[5px] text-[12px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none"
                defaultValue={f.value}
              >
                {f.options?.map((o: string) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : f.type === "number" ? (
              <input
                className="px-[8px] py-[5px] text-[12px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none"
                type="number"
                defaultValue={f.value}
              />
            ) : f.type === "datetime" ? (
              <input
                className="px-[8px] py-[5px] text-[12px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none"
                type="datetime-local"
                defaultValue={f.value}
              />
            ) : (
              <input
                className="px-[8px] py-[5px] text-[12px] rounded border border-(--border-strong) bg-(--bg-elev) outline-none"
                defaultValue={f.value}
              />
            )}
            {f.hint && (
              <div className="text-[10px] text-(--fg-subtle)">
                {f.hint}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-[6px] mt-2">
        <Button size="sm" icon="plus">
          Add custom field
        </Button>
        <Button size="sm" kind="ghost">
          View as JSON
        </Button>
      </div>
    </div>
  );
}
