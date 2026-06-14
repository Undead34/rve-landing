export type RuleMode = "staged" | "active" | "suspended" | "deactivated";
export type EnforcementAction = "allow" | "review" | "block" | "tag_only";
export type EnforcementSeverity =
  | "none"
  | "low"
  | "moderate"
  | "high"
  | "very_high"
  | "catastrophic";

/** Raw API response shape */
export interface FraudRule {
  id: string;
  meta: {
    code: string | null;
    name: string;
    description: string | null;
    version: string;
    author: string;
    tags: string[];
  };
  scope: {
    channels: string[] | null;
  };
  state: {
    mode: RuleMode;
    audit: {
      created_at_ms: number;
      updated_at_ms: number;
      created_by: string | null;
      updated_by: string | null;
    };
  };
  schedule: {
    active_from_ms: number | null;
    active_until_ms: number | null;
  };
  rollout: {
    percent: number;
  };
  evaluation: {
    condition: boolean | number | string | Record<string, unknown>;
    logic: Record<string, unknown>;
  };
  enforcement: {
    score_impact: number;
    action: EnforcementAction;
    severity: EnforcementSeverity;
    tags: string[];
    cooldown_ms: number | null;
    functions: unknown[];
  };
}

/** Payload to create/replace a rule */
export interface RuleInput {
  meta: {
    code?: string | null;
    name: string;
    description?: string | null;
    version: string;
    author: string;
    tags?: string[];
  };
  scope: {
    channels?: string[];
  };
  state: {
    mode: RuleMode;
    audit?: {
      created_at_ms?: number;
      updated_at_ms?: number;
      created_by?: string;
      updated_by?: string;
    };
  };
  schedule: {
    active_from_ms?: number | null;
    active_until_ms?: number | null;
  };
  rollout: {
    percent: number;
  };
  evaluation: {
    condition: boolean | number | string | Record<string, unknown>;
    logic: Record<string, unknown>;
  };
  enforcement: {
    score_impact: number;
    action: EnforcementAction;
    severity: EnforcementSeverity;
    tags: string[];
    cooldown_ms?: number | null;
    functions?: unknown[];
  };
}

export type RulePatchInput = Partial<RuleInput>;

export interface RulesPagination {
  page: number;
  limit: number;
  total: number;
}

export interface RulesListResponse {
  data: FraudRule[];
  pagination: RulesPagination;
}

export interface RuleDecisionRequest {
  header: Record<string, unknown>;
  context: Record<string, unknown>;
  features: Record<string, unknown>;
  signals: Record<string, unknown>;
  payload: Record<string, unknown>;
}

export interface RuleDecisionResponse {
  decision: {
    score: number;
    outcome: string;
    hits: RuleHit[];
    evaluated_rules: number;
    executed_rules: number;
    rollout_bucket: number;
  };
}

export interface RuleHit {
  rule_id: string;
  action: EnforcementAction;
  severity: EnforcementSeverity;
  score_delta: number;
  explanation: string | null;
  tags: string[];
}

export interface FieldDef {
  path: string;
  type: string;
  required: boolean;
  description: string;
  allowed_values?: string[];
  items?: FieldDef;
}

export interface BuilderConfigResponse {
  operator_groups: Record<string, string[]>;
  root_vars: string[];
  enums: Record<string, string[]>;
  rule_fields: FieldDef[];
  rule_schema_version: string;
}

export interface EngineStatusResponseDoc {
  mode: string;
  ready: boolean;
  repository_rules: number;
  loaded_rules: number;
  message: string;
}


export type ConditionOperator =
  | "="
  | "≠"
  | ">"
  | "<"
  | "≥"
  | "≤"
  | "between"
  | "in"
  | "not_in"
  | "starts_with"
  | "ends_with"
  | "contains"
  | "regex"
  | "is_true"
  | "is_false"
  | "before"
  | "after"
  | "within_last";

export const OPERATOR_MAP_BY_TYPE: Record<string, ConditionOperator[]> = {
  number: ["=", "≠", ">", "<", "≥", "≤", "between", "in", "not_in"],
  string: ["=", "≠", "in", "not_in", "starts_with", "ends_with", "contains", "regex"],
  enum: ["=", "≠", "in", "not_in"],
  boolean_like: ["is_true", "is_false"],
  ip: ["=", "≠", "in", "not_in"],
  datetime: ["before", "after", "between", "within_last"],
  text: ["=", "≠", "contains", "starts_with", "ends_with"],
  timestamp_ms: ["before", "after", "between"],
  semver: ["=", "≠", ">", "<", "≥", "≤"],
};

export const JSONLOGIC_OPERATOR_MAP: Record<ConditionOperator, string> = {
  "=": "==",
  "≠": "!=",
  ">": ">",
  "<": "<",
  "≥": ">=",
  "≤": "<=",
  between: "between",
  in: "in",
  not_in: "not_in",
  starts_with: "starts_with",
  ends_with: "ends_with",
  contains: "contains",
  regex: "regex",
  is_true: "!!",
  is_false: "!",
  before: "<",
  after: ">",
  within_last: "within_last",
};
