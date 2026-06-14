"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { ModeBadge, ActionBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HttpRuleRepository } from "@/lib/infrastructure/http-repository";
import { useRuleCrud } from "@/lib/hooks/useRuleCrud";
import { type FraudRule } from "@/lib/domain/types";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";

const repository = new HttpRuleRepository();

function RuleInspectorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ruleId = searchParams.get("id");
  const { loadRule } = useRuleCrud();

  const [rule, setRule] = useState<FraudRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [allRules, setAllRules] = useState<FraudRule[]>([]);
  const [engineReady, setEngineReady] = useState(true);
  const [rulesLoadedCount, setRulesLoadedCount] = useState(0);

  const fetchRuleDetails = async () => {
    if (!ruleId) return;
    setLoading(true);
    try {
      // Load rules into store (to prepare for edit) and get rule data
      const data = await loadRule(ruleId);
      if (data) {
        setRule(data);
      }

      // Fetch all rules for "Related rules" tab
      const allRes = await repository.getAll(1, 100);
      setAllRules(allRes.data);

      const status = await repository.getEngineStatus();
      setEngineReady(status.ready);
      setRulesLoadedCount(status.loaded_rules);
    } catch (err) {
      console.error("Failed to load rule details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRuleDetails();
  }, [ruleId]);

  // Actions
  const handleToggleState = async (newMode: "active" | "suspended" | "deactivated") => {
    if (!rule) return;
    setLoading(true);
    try {
      await repository.patch(rule.id, {
        state: { mode: newMode },
      });
      await fetchRuleDetails();
    } catch (err) {
      alert("Failed to update rule state: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rule) return;
    if (!confirm("Are you sure you want to permanently delete this rule? This cannot be undone.")) return;
    setLoading(true);
    try {
      await repository.delete(rule.id);
      router.push("/rules");
    } catch (err) {
      alert("Failed to delete rule: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  // Memoized related rules (same channels or same tags)
  const relatedRules = useMemo(() => {
    if (!rule) return [];
    return allRules
      .filter((r) => r.id !== rule.id)
      .filter((r) => {
        const sharedTags = (r.meta.tags || []).some((t) => (rule.meta.tags || []).includes(t));
        const sharedChannels = (r.scope.channels || []).some((c) => (rule.scope.channels || []).includes(c));
        return sharedTags || sharedChannels;
      })
      .slice(0, 4);
  }, [rule, allRules]);

  if (!ruleId) {
    return (
      <AppShell
        sidebar={<Sidebar currentRoute="inspector" navItems={NAV_ITEMS} adminItems={ADMIN_ITEMS} footer={<SidebarFooter />} />}
        topbar={<Topbar breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule Inspector" }]} />}
      >
        <div className="p-8 text-center text-[var(--fg-muted)]">No rule selected to inspect. Please open library first.</div>
      </AppShell>
    );
  }

  if (loading && !rule) {
    return (
      <AppShell
        sidebar={<Sidebar currentRoute="inspector" navItems={NAV_ITEMS} adminItems={ADMIN_ITEMS} footer={<SidebarFooter />} />}
        topbar={<Topbar breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule Inspector" }]} />}
      >
        <div className="p-8 text-center text-[var(--fg-muted)]">Loading rule details...</div>
      </AppShell>
    );
  }

  if (!rule) {
    return (
      <AppShell
        sidebar={<Sidebar currentRoute="inspector" navItems={NAV_ITEMS} adminItems={ADMIN_ITEMS} footer={<SidebarFooter />} />}
        topbar={<Topbar breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule Inspector" }]} />}
      >
        <div className="p-8 text-center text-[var(--fg-muted)]">Rule not found.</div>
      </AppShell>
    );
  }

  // Audit trail logic based on rule audit info
  const auditTrail = [
    {
      ts: new Date(rule.state.audit.updated_at_ms).toLocaleString(),
      by: rule.state.audit.updated_by || rule.meta.author,
      what: "Updated",
      detail: `Rule state mode is ${rule.state.mode}`,
    },
    {
      ts: new Date(rule.state.audit.created_at_ms).toLocaleString(),
      by: rule.state.audit.created_by || rule.meta.author,
      what: "Created",
      detail: `Initial rule configuration registered with version ${rule.meta.version}`,
    },
  ];

  return (
    <AppShell
      sidebar={
        <Sidebar
          currentRoute="inspector"
          navItems={NAV_ITEMS}
          adminItems={ADMIN_ITEMS}
          footer={<SidebarFooter />}
        />
      }
      topbar={
        <Topbar
          breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule library" }, { label: "Rule inspector" }]}
          engineStatus={{ ready: engineReady, rulesCount: rulesLoadedCount }}
        />
      }
    >
      <div className="mb-4">
        <Button kind="ghost" size="sm" icon="arrow-left" onClick={() => router.push("/rules")}>
          Back to library
        </Button>
      </div>

      <div className="page-header flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <ModeBadge mode={rule.state.mode} />
            <ActionBadge action={rule.enforcement.action} />
            <Badge kind="neutral" mono>v{rule.meta.version}</Badge>
            <Badge kind="neutral" mono>severity: {rule.enforcement.severity}</Badge>
            <Badge kind="neutral" mono>score: {rule.enforcement.score_impact}</Badge>
          </div>
          <h1 className="text-(--fs-xl) font-semibold tracking-[-0.02em] m-0">
            {rule.meta.name}
          </h1>
          <div className="font-mono text-[13px] text-[var(--fg-muted)] mt-1 mb-2">
            {rule.meta.code || rule.id}
          </div>
          {rule.meta.description && (
            <p className="text-[var(--fg-muted)] text-[14px] m-0 max-w-3xl leading-relaxed">
              {rule.meta.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button icon="play" onClick={() => router.push(`/console?id=${rule.id}`)}>
            Simulate
          </Button>
          <Button icon="edit" onClick={() => router.push(`/rules/builder?id=${rule.id}`)}>
            Edit
          </Button>
          {rule.state.mode === "active" ? (
            <Button icon="clock" onClick={() => handleToggleState("suspended")}>
              Suspend
            </Button>
          ) : (
            <Button kind="accent" icon="check" onClick={() => handleToggleState("active")}>
              Activate
            </Button>
          )}
          <Button kind="danger" icon="trash" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] mb-6 flex gap-4">
        {[
          { id: "overview", label: "Overview" },
          { id: "conditions", label: "Conditions" },
          { id: "consequence", label: "Consequence" },
          { id: "history", label: "History", count: auditTrail.length },
          { id: "related", label: "Related rules", count: relatedRules.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-[14px] font-medium border-b-2 transition-all cursor-pointer relative ${
              activeTab === tab.id
                ? "border-[var(--accent)] text-[var(--fg)] font-semibold"
                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-[10px] font-mono bg-[var(--bg-inset)] px-1.5 py-0.5 rounded-full text-[var(--fg-subtle)]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
                <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--fg-muted)] mb-4 mt-0">
                  Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Current Mode</div>
                    <div><ModeBadge mode={rule.state.mode} /></div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Rollout Percent</div>
                    <div className="font-mono font-medium">{rule.rollout.percent}%</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Schedule</div>
                    <div className="text-[13px]">
                      {rule.schedule.active_from_ms ? (
                        <div className="font-mono">
                          From {new Date(rule.schedule.active_from_ms).toLocaleDateString()}
                          {rule.schedule.active_until_ms && ` to ${new Date(rule.schedule.active_until_ms).toLocaleDateString()}`}
                        </div>
                      ) : (
                        <span className="text-[var(--fg-muted)]">Always active</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
                <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--fg-muted)] mb-4 mt-0">
                  Scope
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1.5">Channels</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {(rule.scope.channels || []).map((c) => (
                        <Badge key={c} kind="neutral" mono>{c}</Badge>
                      ))}
                      {(!rule.scope.channels || rule.scope.channels.length === 0) && (
                        <span className="text-[12px] text-[var(--fg-subtle)]">All channels</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1.5">Tags</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {(rule.meta.tags || []).map((t) => (
                        <Badge key={t} kind="neutral" mono>{t}</Badge>
                      ))}
                      {(!rule.meta.tags || rule.meta.tags.length === 0) && (
                        <span className="text-[12px] text-[var(--fg-subtle)]">No tags defined</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
                <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--fg-muted)] mb-4 mt-0">
                  Audit logs
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Author</div>
                    <div className="font-mono text-[13px]">{rule.meta.author}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Created</div>
                    <div className="text-[13px]">
                      {new Date(rule.state.audit.created_at_ms).toLocaleString()}{" "}
                      <span className="text-[var(--fg-subtle)]">by</span> {rule.state.audit.created_by || rule.meta.author}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Last Updated</div>
                    <div className="text-[13px]">
                      {new Date(rule.state.audit.updated_at_ms).toLocaleString()}{" "}
                      <span className="text-[var(--fg-subtle)]">by</span> {rule.state.audit.updated_by || rule.meta.author}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "conditions" && (
          <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-[16px] font-semibold m-0">Evaluation logic</h2>
                <p className="text-[var(--fg-muted)] text-[12px] m-0">JSONLogic representation compiled by the rule engine.</p>
              </div>
              <Button size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(rule.evaluation.logic, null, 2))}>
                Copy JSON logic
              </Button>
            </div>
            <div className="bg-[var(--bg-inset)] rounded-lg p-5 font-mono text-[13px] overflow-x-auto border border-[var(--border)]">
              {/* Recursive logic visualizer */}
              <LogicVisualizer logic={rule.evaluation.logic} />
            </div>
          </div>
        )}

        {activeTab === "consequence" && (
          <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
            <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--fg-muted)] mb-4 mt-0">
              Consequence details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Action</div>
                <div><ActionBadge action={rule.enforcement.action} /></div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Score Impact</div>
                <div className="font-mono text-[16px] font-medium">{rule.enforcement.score_impact} / 10</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Severity</div>
                <div><Badge kind="neutral" mono>{rule.enforcement.severity}</Badge></div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Cooldown Window</div>
                <div className="font-mono text-[13px]">
                  {rule.enforcement.cooldown_ms ? `${rule.enforcement.cooldown_ms / 1000}s (${rule.enforcement.cooldown_ms / 60000}m)` : "No cooldown"}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--fg-subtle)] uppercase tracking-[0.04em] mb-1">Enforcement Tags</div>
                <div className="flex gap-1 flex-wrap mt-1">
                  {rule.enforcement.tags.map((t) => (
                    <Badge key={t} kind="neutral" mono>{t}</Badge>
                  ))}
                  {rule.enforcement.tags.length === 0 && <span className="text-[12px] text-[var(--fg-subtle)]">None</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-1 bottom-1 w-[1px] bg-[var(--border)]" />
              {auditTrail.map((item, idx) => (
                <div key={idx} className="relative pb-6 last:pb-0">
                  <div className="absolute left-[-24px] top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--bg-elev)] border-2 border-[var(--fg)]" />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[13px]">{item.what}</span>
                    <span className="font-mono text-[11px] text-[var(--fg-subtle)]">{item.by}</span>
                    <span className="text-[11px] text-[var(--fg-subtle)] ml-auto">{item.ts}</span>
                  </div>
                  <div className="text-[var(--fg-muted)] text-[12px]">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "related" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedRules.map((r) => (
              <div
                key={r.id}
                onClick={() => router.push(`/rules/inspector?id=${r.id}`)}
                className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 cursor-pointer hover:bg-[var(--bg-hover)]"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex gap-1">
                    <ModeBadge mode={r.state.mode} />
                    <ActionBadge action={r.enforcement.action} />
                  </div>
                </div>
                <div className="font-medium text-[14px]">{r.meta.name}</div>
                <div className="font-mono text-[11px] text-[var(--fg-muted)] mt-1 mb-2">
                  {r.meta.code || r.id}
                </div>
                <div className="text-[12px] text-[var(--fg-muted)] line-clamp-2">
                  {r.meta.description}
                </div>
              </div>
            ))}
            {relatedRules.length === 0 && (
              <div className="col-span-2 text-center text-[var(--fg-muted)] p-8">No related rules found (sharing tags or channels).</div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function RuleInspectorPage() {
  return (
    <Suspense fallback={
      <AppShell
        sidebar={<Sidebar currentRoute="inspector" navItems={NAV_ITEMS} adminItems={ADMIN_ITEMS} footer={<SidebarFooter />} />}
        topbar={<Topbar breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule Inspector" }]} />}
      >
        <div className="p-8 text-center text-[var(--fg-muted)]">Loading inspector...</div>
      </AppShell>
    }>
      <RuleInspectorContent />
    </Suspense>
  );
}

// Logic Visualizer component to render the JsonLogic tree beautifully
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LogicVisualizer({ logic }: { logic: any }) {
  if (!logic || typeof logic !== "object") {
    return <span className="text-[var(--fg)]">{String(logic)}</span>;
  }

  const entries = Object.entries(logic);
  if (entries.length === 0) return <span>{"{}"}</span>;

  const [op, args] = entries[0];

  if (op === "and" || op === "or") {
    const isAnd = op === "and";
    return (
      <div className="flex flex-col gap-2 pl-4 border-l border-[var(--border-strong)] my-1">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
            isAnd ? "bg-blue-900/40 text-blue-300" : "bg-purple-900/40 text-purple-300"
          }`}>
            {op}
          </span>
          <span className="text-[var(--fg-subtle)] text-[11px] font-mono">({(args as unknown[]).length} conditions)</span>
        </div>
        <div className="flex flex-col gap-3">
          {(args as unknown[]).map((arg, idx) => (
            <div key={idx}>
              <LogicVisualizer logic={arg} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Operators
  const renderOperator = (operator: string) => {
    const label = operator === "==" || operator === "===" ? "=" : operator === "!=" || operator === "!==" ? "≠" : operator;
    return <span className="text-amber-500 font-semibold px-1">{label}</span>;
  };

  if (Array.isArray(args) && args.length >= 2) {
    const left = args[0];
    const right = args[1];

    const renderOperand = (val: unknown) => {
      if (typeof val === "object" && val !== null && "var" in val) {
        return <span className="text-emerald-400 font-mono font-medium">{String((val as Record<string, unknown>).var)}</span>;
      }
      if (typeof val === "string") {
        return <span className="text-rose-400 font-mono">{'"' + val + '"'}</span>;
      }
      return <span className="text-sky-400 font-mono">{String(val)}</span>;
    };

    return (
      <div className="flex items-center flex-wrap gap-1 bg-[var(--bg-elev)] px-3 py-1.5 rounded border border-[var(--border-faint)] w-fit">
        {renderOperand(left)}
        {renderOperator(op)}
        {renderOperand(right)}
      </div>
    );
  }

  // Fallback for custom jsonlogic or negation
  return (
    <div className="text-[var(--fg-muted)] pl-2">
      <span className="text-purple-400 font-semibold">{op}: </span>
      <span className="font-mono text-[12px]">{JSON.stringify(args)}</span>
    </div>
  );
}
