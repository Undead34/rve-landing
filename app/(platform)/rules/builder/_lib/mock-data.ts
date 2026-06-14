import type { Condition } from "@/lib/stores/rule-store";

export const defaultMeta = {
  code: "block_high_velocity_cards",
  name: "Block high-velocity card payments",
  description:
    "Blocks card payments where the card has been used more than 5 times in the past hour. " +
    "Includes a fallback for cards that have been used across 3+ distinct merchants.",
  version: "2.1.0",
  author: "r.tanaka",
  tags: ["velocity", "cards", "high-priority"],
};

export const defaultChannels = [
  "web",
  "mobile",
  "api",
  "branch",
  "atm",
  "callcenter",
];

export const defaultSelectedChannels = ["web", "mobile", "api"];

export const defaultConditionTree: Condition = {
  type: "group",
  op: "AND",
  children: [
    {
      type: "cond",
      field: "payment.method",
      op: "=",
      value: "card",
    },
    {
      type: "group",
      op: "OR",
      children: [
        {
          type: "cond",
          field: "signals.velocity_1h",
          op: ">",
          value: "5",
        },
        {
          type: "cond",
          field: "signals.velocity_24h",
          op: ">",
          value: "20",
        },
      ],
    },
    {
      type: "cond",
      field: "payment.amount",
      op: ">",
      value: "1000",
    },
  ],
};

export const defaultConsequence = {
  action: "block" as const,
  score_impact: 8,
  severity: "high",
  tags: ["high_velocity", "card_fraud"],
  cooldown_seconds: 300,
};

export const defaultPolicy = {
  mode: "active" as const,
  rollout: 100,
  schedule_from: "",
  schedule_to: "",
};
