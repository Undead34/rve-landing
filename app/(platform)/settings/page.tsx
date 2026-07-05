"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { Badge, ModeBadge, ActionBadge, type Mode, type Action } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { HttpRuleRepository } from "@/lib/infrastructure/http-repository";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";

const repository = new HttpRuleRepository();
const SETTINGS_SIDEBAR = (
  <Sidebar
    currentRoute="settings"
    navItems={NAV_ITEMS}
    adminItems={ADMIN_ITEMS}
    footer={<SidebarFooter />}
  />
);
const SETTINGS_BREADCRUMBS = [
  { label: "Red Velvet" },
  { label: "Settings" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("runtime");
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

  const [contractInfo, setContractInfo] = useState({
    version: "v1",
    supportedAssets: ["transaction", "login", "signup", "withdrawal", "password_reset", "kyc_event"],
    channels: ["web", "mobile", "api", "branch", "atm", "callcenter"],
    actions: ["allow", "review", "block", "tag_only"],
    modes: ["staged", "active", "suspended", "deactivated"],
    severities: ["none", "low", "moderate", "high", "very_high", "catastrophic"],
    rootVars: ["event", "customer", "payment", "signals", "features", "context"],
  });

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
          const channelsList = config.enums?.["event.channel"] || config.enums?.["channel"] || contractInfo.channels;
          const assetsList = config.enums?.["event.type"] || contractInfo.supportedAssets;

          setContractInfo((prev) => ({
            ...prev,
            version: config.rule_schema_version || "v1",
            channels: channelsList,
            supportedAssets: assetsList,
            rootVars: config.root_vars || prev.rootVars,
          }));
        }
      } catch (err) {
        console.error("Failed to load backend configurations for settings", err);
      }
    };

    fetchBackendConfig();
  }, []);
  const settingsTopbar = useMemo(
    () => (
      <Topbar
        breadcrumbs={SETTINGS_BREADCRUMBS}
        engineStatus={{ ready: engineReady, rulesCount: rulesLoadedCount }}
      />
    ),
    [engineReady, rulesLoadedCount],
  );

  return (
    <AppShell sidebar={SETTINGS_SIDEBAR} topbar={settingsTopbar}>
      <div className="page-header mb-6">
        <h1 className="text-(--fs-xl) font-semibold tracking-[-0.02em] m-0">Settings</h1>
        <p className="text-(--fg-muted) mt-1 m-0">
          Runtime preferences and integration contract reference.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-(--border) mb-6 flex gap-4">
        {[
          { id: "runtime", label: "Runtime" },
          { id: "contract", label: "Integration contract" },
          { id: "team", label: "Team & access" },
        ].map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[14px] font-medium border-b-2 transition-all cursor-pointer relative ${
              activeTab === tab.id
                ? "border-(--accent) text-(--fg) font-semibold"
                : "border-transparent text-(--fg-muted) hover:text-(--fg)"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === "runtime" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engine settings</CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col gap-5">
                  <ToggleSetting
                    label="Auto-reload on rule change"
                    hint="Engine picks up rule changes within 30 seconds."
                    defaultChecked
                  />
                  <ToggleSetting
                    label="Strict validation on save"
                    hint="Reject rules that don't pass full semantic validation."
                    defaultChecked
                  />
                  <ToggleSetting
                    label="Shadow-eval all staged rules"
                    hint="Evaluate staged rules against live traffic, but never enforce them."
                    defaultChecked
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scoring rules</CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-(--fg) flex items-center gap-1.5">
                      Score Aggregation
                    </label>
                    <span className="text-[11px] text-(--fg-subtle)">How hits combine into a final score.</span>
                    <select className="px-[10px] py-[6px] text-[13px] rounded-(--radius-md) border border-(--border-strong) bg-(--bg-elev) outline-none cursor-pointer w-full md:w-80">
                      <option value="sum_capped">Sum (capped at 10)</option>
                      <option value="max">Maximum hit</option>
                      <option value="weighted">Weighted average</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-(--fg)">Review Threshold</label>
                      <span className="text-[11px] text-(--fg-subtle)">Score ≥ this routes to manual review.</span>
                      <input type="number" defaultValue="3" className="px-[10px] py-[5px] text-[13px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none w-full" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-(--fg)">Block Threshold</label>
                      <span className="text-[11px] text-(--fg-subtle)">Score ≥ this blocks the event transaction.</span>
                      <input type="number" defaultValue="7" className="px-[10px] py-[5px] text-[13px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none w-full" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications & hooks</CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col gap-5">
                  <ToggleSetting label="Alert on rule deactivation" defaultChecked />
                  <ToggleSetting label="Alert on engine reload failure" defaultChecked />
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-[13px] font-semibold text-(--fg)">Webhook Endpoint URL</label>
                    <input type="text" placeholder="https://hooks.example.com/rve-updates" className="px-[10px] py-[5px] text-[13px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none w-full" />
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engine information</CardTitle>
                </CardHeader>
                <CardBody className="flex flex-col gap-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">Engine version</div>
                    <div className="font-mono text-[14px] font-medium">{engineInfo.version}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">Repository Rules</div>
                    <div className="font-mono text-[14px]">{engineInfo.repositoryRules} total rules</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">Loaded Rules</div>
                    <div className="font-mono text-[14px]">{engineInfo.loadedRules} active/staged rules</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">Backend Mode</div>
                    <div className="font-mono text-[13px] text-emerald-400 capitalize">{engineInfo.mode}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">Uptime</div>
                    <div className="font-mono text-[13px]">Running (localhost:3439)</div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "contract" && (
          <div className="flex flex-col gap-6">
            <div className="bg-(--bg-inset) border border-(--border) rounded-lg p-4 flex items-center gap-3">
              <Icon name="info" size={16} className="text-(--accent)" />
              <div className="text-[12px] text-(--fg-muted)">
                Read-only overview of the event schema and constraints validated by the engine. To register new variables or custom assets, extend the backend contract.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Supported assets</CardTitle></CardHeader>
                <CardBody className="flex flex-wrap gap-1.5">
                  {contractInfo.supportedAssets.map((a) => (
                    <Badge key={a} kind="neutral" mono>{a}</Badge>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Channels</CardTitle></CardHeader>
                <CardBody className="flex flex-wrap gap-1.5">
                  {contractInfo.channels.map((c) => (
                    <Badge key={c} kind="neutral" mono>{c}</Badge>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Enforcement actions</CardTitle></CardHeader>
                <CardBody className="flex flex-wrap gap-1.5">
                  {contractInfo.actions.map((a) => (
                    <ActionBadge key={a} action={a as Action} />
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Rule modes</CardTitle></CardHeader>
                <CardBody className="flex flex-wrap gap-1.5">
                  {contractInfo.modes.map((m) => (
                    <ModeBadge key={m} mode={m as Mode} />
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Rule severities</CardTitle></CardHeader>
                <CardBody className="flex flex-wrap gap-1.5">
                  {contractInfo.severities.map((s) => (
                    <Badge key={s} kind="neutral" mono>{s}</Badge>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Root variables</CardTitle></CardHeader>
                <CardBody className="flex flex-wrap gap-1.5">
                  {contractInfo.rootVars.map((v) => (
                    <Badge key={v} kind="neutral" mono>{v}.*</Badge>
                  ))}
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <CardTitle>Event schema reference</CardTitle>
                  <Button size="sm" onClick={() => navigator.clipboard.writeText(`interface Event {\n  event_id?: string;\n  event: {\n    type: string;\n    channel: string;\n    timestamp?: string;\n  };\n  customer: { id: string; kyc_level?: string; };\n  payment?: { amount: number; currency: string; };\n}`)}>
                    Copy types
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="p-0 border-t border-(--border-faint)">
                <pre className="m-0 p-5 bg-(--bg-inset) font-mono text-[12px] leading-relaxed text-(--fg) overflow-x-auto">
{`interface Event {
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
}`}
                </pre>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === "team" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div>
                  <CardTitle>Team members</CardTitle>
                  <span className="text-[12px] text-(--fg-muted)">SSO authentication managed via Active Directory</span>
                </div>
                <Button icon="plus">Invite member</Button>
              </div>
            </CardHeader>
            <CardBody className="p-0 border-t border-(--border-faint)">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-(--bg-inset) border-b border-(--border) text-(--fg-muted) text-[12px] font-medium">
                    <th className="p-3 pl-4">Member</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Marisol Alvarez", handle: "m.alvarez", role: "Fraud Analyst", active: "12m ago" },
                    { name: "Ren Tanaka", handle: "r.tanaka", role: "Safety Manager", active: "2h ago" },
                    { name: "Nora Silva", handle: "n.silva", role: "Fraud Analyst", active: "1d ago" },
                  ].map((m) => (
                    <tr key={m.handle} className="border-b border-(--border-faint) hover:bg-(--bg-hover)">
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-(--bg-active) grid place-items-center font-semibold text-[11px] text-(--fg-muted)">
                            {m.name.split(" ").map(w => w[0]).join("")}
                          </div>
                          <div>
                            <div className="font-semibold">{m.name}</div>
                            <div className="text-[11px] text-(--fg-subtle) font-mono">{m.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge kind="neutral">{m.role}</Badge>
                      </td>
                      <td className="p-3 text-(--fg-subtle)">{m.active}</td>
                      <td className="p-3 text-right">
                        <button type="button" className="icon-btn">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

// Small Toggle subcomponent
function ToggleSetting({ label, hint, defaultChecked = false }: { label: string; hint?: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[13px] font-semibold text-(--fg)">{label}</div>
        {hint && <div className="text-[11px] text-(--fg-subtle) mt-0.5">{hint}</div>}
      </div>
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className={`w-[34px] h-[20px] rounded-full relative cursor-pointer border-none transition-colors shrink-0 ${
          checked ? "bg-(--accent)" : "bg-(--bg-inset) border border-(--border)"
        }`}
      >
        <div
          className={`w-[14px] h-[14px] rounded-full bg-white absolute top-1/2 -translate-y-1/2 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.2)] ${
            checked ? "left-[16px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}
