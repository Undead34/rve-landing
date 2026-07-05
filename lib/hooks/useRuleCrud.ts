"use client";

import { useCallback } from "react";
import { useRuleStore } from "../stores/rule-store";
import { HttpRuleRepository } from "../infrastructure/http-repository";
import type { FraudRule, RuleInput } from "../domain/types";
import { treeToJsonLogic } from "@/lib/utils/jsonlogic";
import { createConditionId, ensureConditionIds } from "@/lib/stores/rule-store";
import { validateRuleDraft } from "./useRuleValidation";

const repository = new HttpRuleRepository();

export function useRuleCrud() {
  const {
    draft,
    ruleId,
    isSaving,
    saveError,
    setRuleId,
    setIsSaving,
    setSaveError,
    markClean,
    resetDraft,
  } = useRuleStore();

  const buildRuleInput = useCallback((): RuleInput => {
    const now = Date.now();
    const logic = treeToJsonLogic(
      draft.conditionTree as unknown as Record<string, unknown>,
    );

    return {
      meta: {
        code: draft.identity.code || null,
        name: draft.identity.name,
        description: draft.identity.description || null,
        version: draft.identity.version,
        author: draft.identity.author,
        tags: draft.identity.tags,
      },
      scope: {
        channels: draft.channels,
      },
      state: {
        mode: draft.policy.mode,
        audit: {
          created_at_ms: now,
          updated_at_ms: now,
          created_by: draft.identity.author,
          updated_by: draft.identity.author,
        },
      },
      schedule: {
        active_from_ms: draft.policy.schedule_from
          ? new Date(draft.policy.schedule_from).getTime()
          : null,
        active_until_ms: draft.policy.schedule_to
          ? new Date(draft.policy.schedule_to).getTime()
          : null,
      },
      rollout: {
        percent: draft.policy.rollout,
      },
      evaluation: {
        condition: draft.evaluationCondition,
        logic,
      },
      enforcement: {
        score_impact: draft.enforcement.score_impact,
        action: draft.enforcement.action,
        severity: draft.enforcement.severity,
        tags: draft.enforcement.tags,
        cooldown_ms: draft.enforcement.cooldown_seconds * 1000 || null,
        functions: [],
      },
    };
  }, [draft]);

  const saveRule = useCallback(async () => {
    setSaveError(null);

    const validation = validateRuleDraft(draft);
    if (!validation.isValid) {
      setSaveError(
        `Fix ${validation.errorCount} validation error${
          validation.errorCount === 1 ? "" : "s"
        } before saving`,
      );
      return null;
    }

    setIsSaving(true);

    try {
      const payload = buildRuleInput();

      let saved: FraudRule;
      if (ruleId) {
        saved = await repository.replace(ruleId, payload);
      } else {
        saved = await repository.create(payload);
      }

      setRuleId(saved.id);
      markClean();
      return saved;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save rule";
      setSaveError(msg);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    buildRuleInput,
    draft,
    ruleId,
    markClean,
    setIsSaving,
    setRuleId,
    setSaveError,
  ]);

  const loadRule = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const rule = await repository.getById(id);
        if (!rule) {
          setSaveError(`Rule ${id} not found`);
          return null;
        }

        useRuleStore.setState({
          ruleId: rule.id,
          draft: {
            identity: {
              code: rule.meta.code ?? "",
              name: rule.meta.name,
              description: rule.meta.description ?? "",
              version: rule.meta.version,
              author: rule.meta.author,
              tags: rule.meta.tags ?? [],
            },
            channels: rule.scope.channels ?? [],
            conditionTree: ensureConditionIds(
              jsonLogicToConditionTree(rule.evaluation.logic),
            ),
            evaluationCondition: rule.evaluation.condition,
            enforcement: {
              action: rule.enforcement.action,
              score_impact: rule.enforcement.score_impact,
              severity: rule.enforcement.severity,
              tags: rule.enforcement.tags,
              cooldown_seconds: rule.enforcement.cooldown_ms
                ? Math.floor(rule.enforcement.cooldown_ms / 1000)
                : 0,
            },
            policy: {
              mode: rule.state.mode,
              rollout: rule.rollout.percent,
              schedule_from: rule.schedule.active_from_ms
                ? new Date(rule.schedule.active_from_ms)
                    .toISOString()
                    .slice(0, 16)
                : "",
              schedule_to: rule.schedule.active_until_ms
                ? new Date(rule.schedule.active_until_ms)
                    .toISOString()
                    .slice(0, 16)
                : "",
            },
          },
          isDirty: false,
        });

        return rule;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load rule";
        setSaveError(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [setIsSaving, setSaveError],
  );

  return { saveRule, loadRule, isSaving, saveError, resetDraft, repository };
}

function jsonLogicToConditionTree(
  logic: Record<string, unknown>,
): import("../stores/rule-store").Condition {
  const root: import("../stores/rule-store").Condition = {
    id: createConditionId(),
    type: "group",
    op: "AND",
    children: [],
  };

  if (!logic || typeof logic !== "object") return root;

  const entries = Object.entries(logic);
  if (entries.length === 0) return root;

  const [op, args] = entries[0] as [string, unknown];

  if (op === "and" || op === "or") {
    root.op = op === "or" ? "OR" : "AND";
    if (Array.isArray(args)) {
      root.children = args.map((arg) => {
        if (typeof arg === "object" && arg !== null && !Array.isArray(arg)) {
          const sub = jsonLogicToConditionTree(arg as Record<string, unknown>);
          if (sub.children?.length === 1 && sub.children[0].type === "cond") {
            return sub.children[0];
          }
          return sub;
        }
        return {
          id: createConditionId(),
          type: "cond" as const,
          field: "",
          op: "=",
          value: String(arg),
        };
      });
    }
    return root;
  }

  if (["==", "===", "!=", "!==", ">", "<", ">=", "<="].includes(op)) {
    if (Array.isArray(args) && args.length >= 2) {
      const varField =
        typeof args[0] === "object" && args[0] !== null
          ? (args[0] as Record<string, unknown>).var
          : args[0];
      return {
        id: createConditionId(),
        type: "cond",
        field: String(varField ?? ""),
        op:
          op === "===" || op === "=="
            ? "="
            : op === "!==" || op === "!="
              ? "≠"
              : op,
        value: String(args[1]),
      };
    }
  }

  if (op === "in" || op === "regex") {
    if (Array.isArray(args) && args.length >= 2) {
      const varField =
        typeof args[0] === "object" && args[0] !== null
          ? (args[0] as Record<string, unknown>).var
          : args[0];
      return {
        id: createConditionId(),
        type: "cond",
        field: String(varField ?? ""),
        op: op === "in" ? "in" : "regex",
        value: String(args[1]),
      };
    }
  }

  if (op === "!") {
    if (Array.isArray(args) && args.length === 1) {
      const inner = jsonLogicToConditionTree(
        args[0] as Record<string, unknown>,
      );
      if (inner.type === "cond") {
        return { ...inner, op: "≠" };
      }
    }
  }

  return root;
}
