"use client";

import { useMemo } from "react";
import { useRuleStore, type RuleDraft } from "@/lib/stores/rule-store";

export interface ValidationMessage {
  section: string;
  level: "error" | "warn";
  msg: string;
}

export interface RuleValidation {
  messages: ValidationMessage[];
  errorCount: number;
  warnCount: number;
  isValid: boolean;
}

/**
 * Derives the live validation state for the current rule draft. Extracted from
 * the builder so any panel (or the rule header) can read the same result
 * instead of recomputing it. Each message is tagged with the `section` it
 * belongs to, which lets the validation panel scope itself to what you're
 * currently editing.
 */
export function validateRuleDraft(draft: RuleDraft): RuleValidation {
  const errs: ValidationMessage[] = [];
  const { identity, channels, policy, enforcement } = draft;

  if (!identity.code)
    errs.push({
      section: "metadata",
      level: "error",
      msg: "Rule code is required",
    });
  else if (!/^[a-z][a-z0-9_]+$/.test(identity.code))
    errs.push({
      section: "metadata",
      level: "error",
      msg: "Code must be snake_case",
    });
  if (!identity.name)
    errs.push({
      section: "metadata",
      level: "error",
      msg: "Rule name is required",
    });
  if (!/^\d+\.\d+\.\d+$/.test(identity.version))
    errs.push({
      section: "metadata",
      level: "error",
      msg: "Version must be semver (e.g. 1.0.0)",
    });
  if (channels.length === 0)
    errs.push({
      section: "scope",
      level: "error",
      msg: "At least one channel is required",
    });
  if (enforcement.score_impact < 1 || enforcement.score_impact > 10)
    errs.push({
      section: "consequence",
      level: "error",
      msg: "Score impact must be between 1 and 10",
    });
  if (policy.rollout < 0 || policy.rollout > 100)
    errs.push({
      section: "policy",
      level: "error",
      msg: "Rollout must be between 0 and 100",
    });
  if (
    policy.schedule_from &&
    policy.schedule_to &&
    policy.schedule_from >= policy.schedule_to
  )
    errs.push({
      section: "policy",
      level: "error",
      msg: "Schedule end must be after start",
    });

  const warns: ValidationMessage[] = [];
  if (policy.mode === "active" && policy.rollout < 100)
    warns.push({
      section: "policy",
      level: "warn",
      msg: "Active rule with rollout < 100% will only evaluate a subset of traffic",
    });
  if (enforcement.action === "block" && enforcement.score_impact < 7)
    warns.push({
      section: "consequence",
      level: "warn",
      msg: "Block action with low score impact is unusual",
    });

  const messages = [...errs, ...warns];
  const errorCount = errs.length;
  const warnCount = warns.length;

  return { messages, errorCount, warnCount, isValid: errorCount === 0 };
}

export function useRuleValidation(): RuleValidation {
  const draft = useRuleStore((s) => s.draft);

  return useMemo(() => validateRuleDraft(draft), [draft]);
}
