"use server";

import { revalidatePath } from "next/cache";
import { HttpRuleRepository } from "@/lib/infrastructure/http-repository";
import {
  engine as mockEngine,
  ruleCounts as mockRuleCounts,
} from "./_lib/mock-data";

const repository = new HttpRuleRepository();

export interface RuleCounts {
  active: number;
  staged: number;
  suspended: number;
  deactivated: number;
}

export interface EngineSnapshot {
  engine: typeof mockEngine;
  ruleCounts: RuleCounts;
}

export async function getEngineSnapshot(): Promise<EngineSnapshot> {
  try {
    const [status, rulesRes] = await Promise.all([
      repository.getEngineStatus(),
      repository.getAll(1, 100),
    ]);

    const counts: RuleCounts = {
      active: 0,
      staged: 0,
      suspended: 0,
      deactivated: 0,
    };
    for (const rule of rulesRes.data) {
      const mode = rule.state?.mode;
      if (mode && mode in counts) counts[mode]++;
    }

    return {
      engine: {
        ...mockEngine,
        status: status.ready ? "ready" : "not_ready",
        rules_loaded: status.loaded_rules,
        rules_in_repo: status.repository_rules,
      },
      ruleCounts: counts,
    };
  } catch (err) {
    console.error("Failed to load dashboard data from backend", err);
    return { engine: mockEngine, ruleCounts: mockRuleCounts };
  }
}

export async function reloadEngine(): Promise<EngineSnapshot> {
  await repository.reloadEngine();
  revalidatePath("/dashboard");
  const snapshot = await getEngineSnapshot();
  return {
    ...snapshot,
    engine: {
      ...snapshot.engine,
      last_reload_at: new Date().toISOString(),
      last_reload_by: "dashboard",
    },
  };
}
