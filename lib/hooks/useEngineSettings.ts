import { useEffect, useState } from "react";
import { HttpRuleRepository } from "../infrastructure/http-repository";

const repository = new HttpRuleRepository();

const DEFAULT_CONTRACT_INFO = {
  version: "v1",
  supportedAssets: [
    "transaction",
    "login",
    "signup",
    "withdrawal",
    "password_reset",
    "kyc_event",
  ],
  channels: ["web", "mobile", "api", "branch", "atm", "callcenter"],
  actions: ["allow", "review", "block", "tag_only"],
  modes: ["staged", "active", "suspended", "deactivated"],
  severities: [
    "none",
    "low",
    "moderate",
    "high",
    "very_high",
    "catastrophic",
  ],
  rootVars: [
    "event",
    "customer",
    "payment",
    "signals",
    "features",
    "context",
  ],
};

export function useEngineSettings() {
  const [engineReady, setEngineReady] = useState(true);
  const [rulesLoadedCount, setRulesLoadedCount] = useState(0);

  // Live Backend Metadata
  const [engineInfo, setEngineInfo] = useState({
    version: "v0.1.0",
    mode: "redis-backed",
    message: "listening",
    loadedRules: 0,
    repositoryRules: 0,
  });

  const [contractInfo, setContractInfo] = useState(DEFAULT_CONTRACT_INFO);

  useEffect(() => {
    const fetchBackendConfig = async () => {
      try {
        const status = await repository.getEngineStatus();
        setEngineReady(status.ready);
        setRulesLoadedCount(status.loaded_rules);
        setEngineInfo({
          version: "v0.1.0",
          mode: status.mode,
          message: status.message,
          loadedRules: status.loaded_rules,
          repositoryRules: status.repository_rules,
        });

        const config = await repository.getBuilderConfig();
        if (config) {
          setContractInfo((prev) => {
            const channelsList =
              config.enums?.["event.channel"] ||
              config.enums?.["channel"] ||
              prev.channels;
            const assetsList =
              config.enums?.["event.type"] || prev.supportedAssets;

            return {
              ...prev,
              version: config.rule_schema_version || "v1",
              channels: channelsList,
              supportedAssets: assetsList,
              rootVars: config.root_vars || prev.rootVars,
            };
          });
        }
      } catch (err) {
        console.error(
          "Failed to load backend configurations for settings",
          err,
        );
      }
    };

    fetchBackendConfig();
  }, []);

  return { engineReady, rulesLoadedCount, engineInfo, contractInfo };
}
