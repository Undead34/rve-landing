"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { ResultPanel } from "@/components/console/result-panel";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeKind } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { HttpRuleRepository } from "@/lib/infrastructure/http-repository";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";

const repository = new HttpRuleRepository();
const CONSOLE_SIDEBAR = (
  <Sidebar
    currentRoute="console"
    navItems={NAV_ITEMS}
    adminItems={ADMIN_ITEMS}
    footer={<SidebarFooter />}
  />
);
const CONSOLE_BREADCRUMBS = [
  { label: "Red Velvet" },
  { label: "Decision console" },
];

// Standard RVE OpenAPI-compliant Decision Request payload
const DEFAULT_PAYLOAD = {
  header: {
    event_id: "123e4567-e89b-12d3-a456-426614174000",
    channel: "web",
    instrument: "card",
    source: "checkout",
    timestamp: new Date().toISOString(),
  },
  payload: {
    type: "value_transfer",
    money: {
      minor_units: 150000,
      ccy: "USD",
    },
    parties: {
      originator: {
        acct: "acc_1",
        bank: "bank_1",
        country: "US",
        entity_type: "individual",
        kyc: "tier_2",
        sanctions_score: 0.01,
        watchlist: "no",
      },
      beneficiary: {
        acct: "acc_2",
        bank: "bank_2",
        country: "US",
        entity_type: "business",
        kyc: "tier_3",
        sanctions_score: 0.0,
        watchlist: "no",
      },
    },
    extensions: {
      transaction: {
        amount: 1500,
      },
      device: {
        trust_score: 0.7,
      },
    },
  },
  context: {
    env: {
      device_id: "dev_1",
      session_id: "sess_1",
    },
    geo: {
      country: "US",
      lat: 40.71,
      lon: -74.01,
    },
    net: {
      source_ip: "203.0.113.10",
    },
  },
  features: {
    fin: {
      consecutive_declines: 0,
      consecutive_failed_logins: 0,
      current_day_amount: 1500,
      current_day_count: 3,
      current_hour_amount: 1500,
      current_hour_count: 2,
      first_seen_at: 1730000000000,
      known_devices: ["dev_1"],
      known_ips: ["203.0.113.10"],
      last_declined_at: null,
      last_seen_at: Date.now() - 5000,
      max_ticket_ever: 45000,
      total_amount_spent: 150000,
      total_declined_txns: 1,
      total_successful_txns: 12,
    },
  },
  signals: {
    flags: {},
  },
};
type ConsolePayload = typeof DEFAULT_PAYLOAD & {
  signals: typeof DEFAULT_PAYLOAD.signals & { velocity_1h?: number };
};

interface DecisionResult {
  event_id: string;
  outcome: string;
  score: number;
  duration_ms: number;
  rules_evaluated: number;
  rules_hit: Array<{
    rule_id: string;
    version: string;
    action: string;
    severity: string;
    score_delta: number;
    reason: string;
  }>;
}

interface TraceStep {
  step: number;
  phase: string;
  action: string;
  detail: string;
  duration_us: number;
  hit: boolean;
}

interface RecentSim {
  id: string;
  label: string;
  outcome: string;
  score: number;
  when: string;
}

export default function DecisionConsolePage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("json");
  const [jsonContent, setJsonContent] = useState(() =>
    JSON.stringify(DEFAULT_PAYLOAD, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(
    null,
  );
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [recentSimulations, setRecentSimulations] = useState<RecentSim[]>([
    {
      id: "sim_8af3",
      label: "card velocity x6 same BIN",
      outcome: "block",
      score: 8.8,
      when: "1h ago",
    },
    {
      id: "sim_8a40",
      label: "normal card payment",
      outcome: "allow",
      score: 0.6,
      when: "3h ago",
    },
  ]);
  const [engineReady, setEngineReady] = useState(true);
  const [rulesLoadedCount, setRulesLoadedCount] = useState(0);

  // Sync engine stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const status = await repository.getEngineStatus();
        setEngineReady(status.ready);
        setRulesLoadedCount(status.loaded_rules);
      } catch (err) {
        console.error("Failed to fetch engine stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleJsonChange = (val: string) => {
    setJsonContent(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON syntax");
    }
  };

  const handleEvaluate = async () => {
    if (jsonError) {
      alert("Please fix the JSON errors before evaluating.");
      return;
    }

    setEvaluating(true);
    try {
      const payload = JSON.parse(jsonContent);
      // Ensure unique event ID if none exists
      if (!payload.header) payload.header = {};
      if (!payload.header.event_id) {
        payload.header.event_id =
          "evt_" + Math.random().toString(36).substr(2, 9);
      }
      payload.header.timestamp = new Date().toISOString();

      // Update JSON field with generated event ID
      setJsonContent(JSON.stringify(payload, null, 2));

      const startTime = Date.now();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await repository.decideTrace(payload);
      const latency = Date.now() - startTime;

      // Map backend Decision response into UI format
      const outcome = res.decision.outcome;
      const score = res.decision.score;

      setDecisionResult({
        event_id: payload.header.event_id || "evt_simulated",
        outcome: outcome,
        score: score,
        duration_ms: latency,
        rules_evaluated: res.decision.evaluated_rules || rulesLoadedCount,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rules_hit: (res.decision.hits || []).map((h: any) => ({
          rule_id: h.rule_id,
          version: "1.0.0",
          action: h.action,
          severity: h.severity,
          score_delta: h.score_delta,
          reason: h.explanation || "Rule conditions matched",
        })),
      });

      // Map trace steps
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const steps = (res.trace?.steps || []).map((step: any, idx: number) => ({
        step: idx + 1,
        phase:
          step.task_id === "emit_hit"
            ? "evaluate"
            : step.task_id === "reload"
              ? "preprocess"
              : "enrich",
        action: step.rule_id || step.task_id || "evaluate",
        detail:
          step.result === "executed"
            ? `HIT - executed workflow ${step.workflow_id}`
            : `Workflow: ${step.result}`,
        duration_us: Math.floor(Math.random() * 200) + 50,
        hit: step.task_id === "emit_hit" && step.result === "executed",
      }));
      setTraceSteps(steps);

      // Add to recent simulations list
      const newSim: RecentSim = {
        id: "sim_" + Math.random().toString(36).substr(2, 4),
        label: `${payload.payload?.type || "event"} payment: ${payload.payload?.money?.minor_units / 100} ${payload.payload?.money?.ccy || "USD"}`,
        outcome: outcome,
        score: score,
        when: "just now",
      };
      setRecentSimulations((prev) => [newSim, ...prev.slice(0, 4)]);
    } catch (err) {
      alert(
        "Evaluation failed: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setEvaluating(false);
    }
  };

  const loadSimIntoConsole = (simType: string) => {
    const payloadCopy = structuredClone(DEFAULT_PAYLOAD) as ConsolePayload;
    if (simType === "card_velocity") {
      payloadCopy.signals.velocity_1h = 6;
      payloadCopy.payload.money.minor_units = 24850;
      payloadCopy.payload.extensions.transaction.amount = 248.5;
    } else if (simType === "normal") {
      payloadCopy.features.fin.current_hour_count = 0;
      payloadCopy.features.fin.current_day_count = 1;
      payloadCopy.payload.money.minor_units = 1500;
      payloadCopy.payload.extensions.transaction.amount = 15.0;
    }
    setJsonContent(JSON.stringify(payloadCopy, null, 2));
    setJsonError(null);
  };

  const consoleTopbar = useMemo(
    () => (
      <Topbar
        breadcrumbs={CONSOLE_BREADCRUMBS}
        engineStatus={{ ready: engineReady, rulesCount: rulesLoadedCount }}
      />
    ),
    [engineReady, rulesLoadedCount],
  );

  return (
    <AppShell noPad sidebar={CONSOLE_SIDEBAR} topbar={consoleTopbar}>
      <div
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: "1fr 380px" }}
      >
        {/* Left column: Event editor */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-6 py-[14px] border-b border-(--border) bg-(--bg-elev) shrink-0">
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
              <Button
                icon="upload"
                onClick={() => loadSimIntoConsole("card_velocity")}
              >
                Template: High Velocity Card
              </Button>
              <Button icon="copy" onClick={() => loadSimIntoConsole("normal")}>
                Template: Low Value
              </Button>
              <Button
                kind="accent"
                icon="play"
                onClick={handleEvaluate}
                disabled={evaluating || !!jsonError}
              >
                {evaluating ? "Evaluating..." : "Evaluate"}
              </Button>
            </div>
          </div>

          <div
            className="flex-1 overflow-hidden grid"
            style={{ gridTemplateColumns: "180px 1fr" }}
          >
            {/* Sidebar section menu */}
            <div className="border-r border-(--border) p-3 bg-(--bg-elev) overflow-y-auto">
              <div className="text-(--fs-xs) text-(--fg-subtle) uppercase tracking-[0.06em] px-1 pb-2 font-medium">
                Editor type
              </div>
              <div className="flex flex-col gap-[2px] mb-4">
                <button
                  type="button"
                  onClick={() => setActiveSection("json")}
                  className={`flex items-center gap-[10px] w-full px-2 py-[6px] rounded-(--radius-sm) cursor-pointer select-none text-(--fs-md) border-none text-left bg-transparent ${
                    activeSection === "json"
                      ? "bg-(--bg-active) text-(--fg) font-medium"
                      : "text-(--fg-muted) hover:bg-(--bg-hover) hover:text-(--fg)"
                  }`}
                >
                  <Icon name="code" size={14} />
                  <span>JSON Editor</span>
                </button>
              </div>

              <div className="h-[1px] bg-(--border-faint) my-3" />
              <div className="text-(--fs-xs) text-(--fg-subtle) uppercase tracking-[0.06em] px-1 pb-2 font-medium">
                Simulation History
              </div>
              <div className="flex flex-col gap-2">
                {recentSimulations.map((s) => (
                  <div
                    key={s.id}
                    className="p-2 border border-(--border-faint) rounded bg-(--bg-inset) hover:bg-(--bg-hover) cursor-pointer transition-colors"
                    onClick={() => {
                      // Parse standard outcomes
                      const mockSim = structuredClone(
                        DEFAULT_PAYLOAD,
                      ) as ConsolePayload;
                      if (s.outcome === "block") {
                        mockSim.signals.velocity_1h = 7;
                        mockSim.payload.money.minor_units = 250000;
                      } else {
                        mockSim.signals.velocity_1h = 1;
                        mockSim.payload.money.minor_units = 1000;
                      }
                      setJsonContent(JSON.stringify(mockSim, null, 2));
                      setJsonError(null);
                    }}
                  >
                    <div className="flex justify-between items-center gap-1 mb-1">
                      <span className="font-mono text-[10px] text-(--fg-subtle)">
                        {s.id}
                      </span>
                      <Badge kind={s.outcome as BadgeKind} dot>
                        {s.outcome}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-(--fg-muted) leading-tight truncate">
                      {s.label}
                    </div>
                    <div className="text-[10px] text-(--fg-subtle) mt-1">
                      {s.when} · score {s.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* JSON Editor panel */}
            <div className="flex-1 overflow-hidden p-6 flex flex-col gap-4">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-[12px] font-semibold text-(--fg-muted) uppercase tracking-[0.04em]">
                    Request Payload (application/json)
                  </span>
                  {jsonError && (
                    <span className="text-[11px] text-red-400 font-medium">
                      Error: {jsonError}
                    </span>
                  )}
                </div>
                <textarea
                  className={`flex-1 font-mono text-[13px] leading-relaxed p-4 rounded-lg bg-(--bg-inset) border outline-none resize-none overflow-y-auto ${
                    jsonError
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-(--border) focus:border-(--accent)"
                  }`}
                  value={jsonContent}
                  onChange={(e) => handleJsonChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Simulation Results */}
        <ResultPanel
          decision={decisionResult}
          trace={traceSteps}
          onNavigate={(id) => router.push(`/rules/inspector?id=${id}`)}
        />
      </div>
    </AppShell>
  );
}
