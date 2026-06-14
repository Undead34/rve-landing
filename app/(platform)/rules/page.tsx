"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { RuleFilters } from "@/components/rules/rule-filters";
import { RuleTable, type RuleRowData } from "@/components/rules/rule-table";
import { RuleCard } from "@/components/rules/rule-card";
import { BulkActions } from "@/components/rules/bulk-actions";
import { Button } from "@/components/ui/button";
import { HttpRuleRepository } from "@/lib/infrastructure/http-repository";
import { type FraudRule } from "@/lib/domain/types";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";

const repository = new HttpRuleRepository();
const DEFAULT_CHANNELS = ["web", "mobile", "api", "branch", "atm", "callcenter"];

export default function RuleLibraryPage() {
  const router = useRouter();
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [channels, setChannels] = useState<string[]>(DEFAULT_CHANNELS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [view, setView] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [engineReady, setEngineReady] = useState(true);
  const [rulesLoadedCount, setRulesLoadedCount] = useState(0);

  const fetchRulesAndConfig = async () => {
    setLoading(true);
    try {
      const res = await repository.getAll(1, 100);
      setRules(res.data);

      const status = await repository.getEngineStatus();
      setEngineReady(status.ready);
      setRulesLoadedCount(status.loaded_rules);

      const config = await repository.getBuilderConfig();
      if (config && config.rule_fields) {
        // Extract channels from config enums or fields if available
        const channelEnum = config.enums?.["event.channel"] || config.enums?.["channel"];
        if (channelEnum) setChannels(channelEnum);
      }
    } catch (err) {
      console.error("Failed to load rules list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRulesAndConfig();
  }, []);

  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (modeFilter !== "all" && r.state.mode !== modeFilter) return false;
      if (channelFilter !== "all" && !(r.scope.channels || []).includes(channelFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = r.meta.name.toLowerCase().includes(q);
        const codeMatch = (r.meta.code || "").toLowerCase().includes(q);
        const tagMatch = (r.meta.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!nameMatch && !codeMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [rules, search, modeFilter, channelFilter]);

  const tableData = useMemo<RuleRowData[]>(() => {
    return filteredRules.map((r) => ({
      code: r.meta.code || r.id,
      name: r.meta.name,
      version: r.meta.version,
      mode: r.state.mode,
      action: r.enforcement.action,
      channels: r.scope.channels || [],
      score_impact: r.enforcement.score_impact,
      rollout: r.rollout.percent,
      hits_7d: 0, // Mock metric not returned in default Rule schema
      updated_at: new Date(r.state.audit.updated_at_ms).toISOString(),
      tags: r.meta.tags || [],
      description: r.meta.description || "",
    }));
  }, [filteredRules]);

  // Bulk actions handlers
  const handleClearSelected = () => setSelected(new Set());

  const resolveId = (codeOrId: string): string => {
    const matched = rules.find((r) => r.meta.code === codeOrId || r.id === codeOrId);
    return matched ? matched.id : codeOrId;
  };

  const handleToggle = (codeOrId: string) => {
    const id = resolveId(codeOrId);
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleToggleAll = () => {
    const allFilteredIds = filteredRules.map((r) => r.id);
    const allSelected = allFilteredIds.every((id) => selected.has(id));
    if (allSelected) {
      const next = new Set(selected);
      allFilteredIds.forEach((id) => next.delete(id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      allFilteredIds.forEach((id) => next.add(id));
      setSelected(next);
    }
  };

  const handleOpen = (codeOrId: string) => {
    const id = resolveId(codeOrId);
    router.push(`/rules/inspector?id=${id}`);
  };

  const handleBulkModeUpdate = async (mode: "active" | "suspended" | "deactivated") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        ids.map((id) =>
          repository.patch(id, {
            state: { mode },
          })
        )
      );
      setSelected(new Set());
      await fetchRulesAndConfig();
    } catch (err) {
      alert("Failed to update rules: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${ids.length} rules?`)) return;
    setLoading(true);
    try {
      await Promise.all(ids.map((id) => repository.delete(id)));
      setSelected(new Set());
      await fetchRulesAndConfig();
    } catch (err) {
      alert("Failed to delete rules: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const allSelected = filteredRules.length > 0 && filteredRules.every((r) => selected.has(r.id));

  return (
    <AppShell
      sidebar={
        <Sidebar
          currentRoute="library"
          navItems={NAV_ITEMS}
          adminItems={ADMIN_ITEMS}
          footer={<SidebarFooter />}
        />
      }
      topbar={
        <Topbar
          breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule library" }]}
          engineStatus={{ ready: engineReady, rulesCount: rulesLoadedCount }}
        />
      }
    >
      <div className="page-header flex items-center justify-between mb-6">
        <div>
          <h1 className="text-(--fs-xl) font-semibold tracking-[-0.02em] m-0">
            Rule library
          </h1>
          <p className="text-(--fg-muted) mt-1 m-0">
            {rules.length} rules · filter, browse, and bulk-manage rules across all modes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon="download">Export</Button>
          <Button
            kind="accent"
            icon="plus"
            onClick={() => router.push("/rules/builder")}
          >
            New rule
          </Button>
        </div>
      </div>

      <RuleFilters
        search={search}
        onSearchChange={setSearch}
        modeFilter={modeFilter}
        onModeFilterChange={setModeFilter}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        channels={channels}
        total={rules.length}
        filtered={filteredRules.length}
        view={view}
        onViewChange={setView}
      />

      <BulkActions
        count={selected.size}
        onClear={handleClearSelected}
        onActivate={() => handleBulkModeUpdate("active")}
        onSuspend={() => handleBulkModeUpdate("suspended")}
        onDeactivate={() => handleBulkModeUpdate("deactivated")}
        onDelete={handleBulkDelete}
      />

      {loading && rules.length === 0 ? (
        <div className="flex items-center justify-center p-12 text-[var(--fg-muted)]">
          Loading rules repository...
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] p-12 text-center">
          <div className="text-[var(--fs-lg)] font-medium mb-2">No rules match the filters</div>
          <p className="text-[var(--fg-muted)] mb-4">Try clearing filters or search term to see other rules.</p>
          <Button onClick={() => { setSearch(""); setModeFilter("all"); setChannelFilter("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : view === "table" ? (
        <RuleTable
          rules={tableData}
          selected={new Set(Array.from(selected).map(id => {
            const r = rules.find(rule => rule.id === id);
            return r ? (r.meta.code || r.id) : id;
          }))}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
          allSelected={allSelected}
          onOpen={handleOpen}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tableData.map((r) => (
            <RuleCard key={r.code} rule={r} onOpen={handleOpen} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
