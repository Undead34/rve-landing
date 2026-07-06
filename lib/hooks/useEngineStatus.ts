import { useEffect, useState } from "react";
import { HttpRuleRepository } from "../infrastructure/http-repository";

const repository = new HttpRuleRepository();

export function useEngineStatus() {
  const [engineReady, setEngineReady] = useState(true);
  const [rulesLoadedCount, setRulesLoadedCount] = useState(0);

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

  return { engineReady, rulesLoadedCount };
}
