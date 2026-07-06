import {
  Badge,
  ModeBadge,
  ActionBadge,
  type Mode,
  type Action,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

interface ContractInfo {
  supportedAssets: string[];
  channels: string[];
  actions: string[];
  modes: string[];
  severities: string[];
  rootVars: string[];
}

const EVENT_SCHEMA_TYPES = `interface Event {
  event_id?: string;
  event: {
    type: "transaction" | "login" | "signup" | "withdrawal" | "password_reset" | "kyc_event";
    channel: "web" | "mobile" | "api" | "branch" | "atm" | "callcenter";
    timestamp?: string;
  };
  customer: {
    id: string;
    age_days?: number;
    kyc_level?: "L0" | "L1" | "L2" | "L3";
    risk_segment?: "low" | "medium" | "high";
  };
  payment?: {
    amount: number;
    currency: string;
    method: "card" | "ach" | "wire" | "crypto" | "pix";
    card_bin?: string;
  };
  signals?: Record<string, number | string | boolean>;
  features?: Record<string, number>;
  context?: Record<string, unknown>;
}`;

export function ContractTab({
  contractInfo,
}: {
  contractInfo: ContractInfo;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-(--bg-inset) border border-(--border) rounded-lg p-4 flex items-center gap-3">
        <Icon name="info" size={16} className="text-(--accent)" />
        <div className="text-[12px] text-(--fg-muted)">
          Read-only overview of the event schema and constraints validated by
          the engine. To register new variables or custom assets, extend the
          backend contract.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supported assets</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-1.5">
            {contractInfo.supportedAssets.map((a) => (
              <Badge key={a} kind="neutral" mono>
                {a}
              </Badge>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-1.5">
            {contractInfo.channels.map((c) => (
              <Badge key={c} kind="neutral" mono>
                {c}
              </Badge>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enforcement actions</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-1.5">
            {contractInfo.actions.map((a) => (
              <ActionBadge key={a} action={a as Action} />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rule modes</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-1.5">
            {contractInfo.modes.map((m) => (
              <ModeBadge key={m} mode={m as Mode} />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rule severities</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-1.5">
            {contractInfo.severities.map((s) => (
              <Badge key={s} kind="neutral" mono>
                {s}
              </Badge>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Root variables</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-1.5">
            {contractInfo.rootVars.map((v) => (
              <Badge key={v} kind="neutral" mono>
                {v}.*
              </Badge>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <CardTitle>Event schema reference</CardTitle>
            <Button
              size="sm"
              onClick={() =>
                navigator.clipboard.writeText(
                  `interface Event {\n  event_id?: string;\n  event: {\n    type: string;\n    channel: string;\n    timestamp?: string;\n  };\n  customer: { id: string; kyc_level?: string; };\n  payment?: { amount: number; currency: string; };\n}`,
                )
              }
            >
              Copy types
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0 border-t border-(--border-faint)">
          <pre className="m-0 p-5 bg-(--bg-inset) font-mono text-[12px] leading-relaxed text-(--fg) overflow-x-auto">
            {EVENT_SCHEMA_TYPES}
          </pre>
        </CardBody>
      </Card>
    </div>
  );
}
