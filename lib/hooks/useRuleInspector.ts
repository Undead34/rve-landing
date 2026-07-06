import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HttpRuleRepository } from "../infrastructure/http-repository";
import { useRuleCrud } from "./useRuleCrud";
import type { FraudRule } from "../domain/types";

const repository = new HttpRuleRepository();

export function useRuleInspector(ruleId: string | null) {
  const router = useRouter();
  const { loadRule } = useRuleCrud();

  const [rule, setRule] = useState<FraudRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [allRules, setAllRules] = useState<FraudRule[]>([]);
  const [engineReady, setEngineReady] = useState(true);
  const [rulesLoadedCount, setRulesLoadedCount] = useState(0);

  const fetchRuleDetails = useCallback(async () => {
    if (!ruleId) return;
    setLoading(true);
    try {
      // Load rules into store (to prepare for edit) and get rule data
      const data = await loadRule(ruleId);
      if (data) {
        setRule(data);
      }

      // Fetch all rules for "Related rules" tab
      const allRes = await repository.getAll(1, 100);
      setAllRules(allRes.data);

      const status = await repository.getEngineStatus();
      setEngineReady(status.ready);
      setRulesLoadedCount(status.loaded_rules);
    } catch (err) {
      console.error("Failed to load rule details", err);
    } finally {
      setLoading(false);
    }
  }, [ruleId, loadRule]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRuleDetails();
  }, [fetchRuleDetails]);

  const handleToggleState = async (
    newMode: "active" | "suspended" | "deactivated",
  ) => {
    if (!rule) return;
    setLoading(true);
    try {
      await repository.patch(rule.id, {
        state: { mode: newMode },
      });
      await fetchRuleDetails();
    } catch (err) {
      alert(
        "Failed to update rule state: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rule) return;
    if (
      !confirm(
        "Are you sure you want to permanently delete this rule? This cannot be undone.",
      )
    )
      return;
    setLoading(true);
    try {
      await repository.delete(rule.id);
      router.push("/rules");
    } catch (err) {
      alert(
        "Failed to delete rule: " +
          (err instanceof Error ? err.message : String(err)),
      );
      setLoading(false);
    }
  };

  // Memoized related rules (same channels or same tags)
  const relatedRules = useMemo(() => {
    if (!rule) return [];
    return allRules
      .filter((r) => r.id !== rule.id)
      .filter((r) => {
        const sharedTags = (r.meta.tags || []).some((t) =>
          (rule.meta.tags || []).includes(t),
        );
        const sharedChannels = (r.scope.channels || []).some((c) =>
          (rule.scope.channels || []).includes(c),
        );
        return sharedTags || sharedChannels;
      })
      .slice(0, 4);
  }, [rule, allRules]);

  return {
    rule,
    loading,
    engineReady,
    rulesLoadedCount,
    relatedRules,
    handleToggleState,
    handleDelete,
  };
}
