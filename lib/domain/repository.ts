import type {
  BuilderConfigResponse,
  FraudRule,
  RuleDecisionRequest,
  RuleDecisionResponse,
  RuleInput,
  RulePatchInput,
  RulesListResponse,
} from "./types";

export interface RuleRepository {
  healthcheck(): Promise<boolean>;
  getAll(page?: number, limit?: number): Promise<RulesListResponse>;
  getById(id: string): Promise<FraudRule | null>;
  create(rule: RuleInput): Promise<FraudRule>;
  replace(id: string, rule: RuleInput): Promise<FraudRule>;
  patch(id: string, rulePatch: RulePatchInput): Promise<FraudRule>;
  delete(id: string): Promise<void>;
  decide(request: RuleDecisionRequest): Promise<RuleDecisionResponse>;
  getBuilderConfig(): Promise<BuilderConfigResponse>;
}
