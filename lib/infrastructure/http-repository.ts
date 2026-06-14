import type {
  BuilderConfigResponse,
  EngineStatusResponseDoc,
  FraudRule,
  RuleDecisionRequest,
  RuleDecisionResponse,
  RuleInput,
  RulePatchInput,
  RulesListResponse,
} from "../domain/types";
import type { RuleRepository } from "../domain/repository";

interface ApiValidationIssue {
  path: string;
  message: string;
}

interface ApiErrorPayload {
  code?: string;
  message?: string;
  request_id?: string;
  validation?: {
    errors?: ApiValidationIssue[];
    warnings?: ApiValidationIssue[];
  };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseApiError = async (res: Response): Promise<Error> => {
  let payload: ApiErrorPayload | null = null;
  try {
    const parsed = (await res.json()) as unknown;
    payload = isObject(parsed) ? (parsed as ApiErrorPayload) : null;
  } catch {
    payload = null;
  }

  if (res.status === 422 && payload?.validation?.errors?.length) {
    const details = payload.validation.errors
      .map((issue: ApiValidationIssue) => `${issue.path}: ${issue.message}`)
      .join("; ");
    return new Error(details);
  }

  const requestId = payload?.request_id
    ? ` [request_id=${payload.request_id}]`
    : "";
  const message = payload?.message || payload?.code || `HTTP ${res.status}`;
  return new Error(`${message}${requestId}`);
};

export class HttpRuleRepository implements RuleRepository {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const envBaseUrl =
      typeof process !== "undefined"
        ? (process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined)
        : undefined;
    const resolvedBaseUrl =
      baseUrl?.trim() || envBaseUrl?.trim() || "http://localhost:3439";
    this.baseUrl = resolvedBaseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) throw await parseApiError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  async healthcheck(): Promise<boolean> {
    try {
      const res = await this.request<{ status: string }>("/health");
      return res.status === "healthy" || res.status === "ok";
    } catch {
      return false;
    }
  }

  async getAll(page = 1, limit = 20): Promise<RulesListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return this.request<RulesListResponse>(
      `/api/v1/rules?${params.toString()}`
    );
  }

  async getById(id: string): Promise<FraudRule | null> {
    try {
      return await this.request<FraudRule>(`/api/v1/rules/${id}`);
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) return null;
      throw err;
    }
  }

  async create(rule: RuleInput): Promise<FraudRule> {
    return this.request<FraudRule>("/api/v1/rules", {
      method: "POST",
      body: JSON.stringify(rule),
    });
  }

  async replace(id: string, rule: RuleInput): Promise<FraudRule> {
    return this.request<FraudRule>(`/api/v1/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(rule),
    });
  }

  async patch(
    id: string,
    rulePatch: RulePatchInput
  ): Promise<FraudRule> {
    return this.request<FraudRule>(`/api/v1/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(rulePatch),
    });
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/api/v1/rules/${id}`, {
      method: "DELETE",
    });
  }

  async decide(
    request: RuleDecisionRequest
  ): Promise<RuleDecisionResponse> {
    return this.request<RuleDecisionResponse>("/api/v1/decisions", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async decideTrace(request: RuleDecisionRequest): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.request<any>("/api/v1/decisions/trace", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getBuilderConfig(): Promise<BuilderConfigResponse> {
    return this.request<BuilderConfigResponse>(
      "/api/v1/ui/builder-config"
    );
  }

  async getEngineStatus(): Promise<EngineStatusResponseDoc> {
    return this.request<EngineStatusResponseDoc>("/api/v1/engine/status");
  }

  async reloadEngine(): Promise<void> {
    await this.request<void>("/api/v1/engine/reload", {
      method: "POST",
    });
  }
}
