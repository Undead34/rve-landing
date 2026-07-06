import { useState } from "react";
import { HttpRuleRepository } from "../infrastructure/http-repository";
import {
  DEFAULT_PAYLOAD,
  type ConsolePayload,
  type DecisionResult,
  type TraceStep,
  type RecentSim,
} from "../console/default-payload";

const repository = new HttpRuleRepository();

export function useConsoleSimulation(rulesLoadedCount: number) {
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

  const loadSimulationIntoJson = (s: RecentSim) => {
    const mockSim = structuredClone(DEFAULT_PAYLOAD) as ConsolePayload;
    if (s.outcome === "block") {
      mockSim.signals.velocity_1h = 7;
      mockSim.payload.money.minor_units = 250000;
    } else {
      mockSim.signals.velocity_1h = 1;
      mockSim.payload.money.minor_units = 1000;
    }
    setJsonContent(JSON.stringify(mockSim, null, 2));
    setJsonError(null);
  };

  return {
    jsonContent,
    jsonError,
    evaluating,
    decisionResult,
    traceSteps,
    recentSimulations,
    handleJsonChange,
    handleEvaluate,
    loadSimIntoConsole,
    loadSimulationIntoJson,
  };
}
