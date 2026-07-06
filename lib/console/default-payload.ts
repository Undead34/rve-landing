// Standard RVE OpenAPI-compliant Decision Request payload
export const DEFAULT_PAYLOAD = {
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

export type ConsolePayload = typeof DEFAULT_PAYLOAD & {
  signals: typeof DEFAULT_PAYLOAD.signals & { velocity_1h?: number };
};

export interface DecisionResult {
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

export interface TraceStep {
  step: number;
  phase: string;
  action: string;
  detail: string;
  duration_us: number;
  hit: boolean;
}

export interface RecentSim {
  id: string;
  label: string;
  outcome: string;
  score: number;
  when: string;
}
