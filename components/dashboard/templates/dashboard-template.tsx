import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { LiveRefresher } from "@/components/dashboard/live-refresher";
import { DashboardHeader } from "@/components/dashboard/organisms/dashboard-header";
import { EngineStatus } from "@/components/dashboard/organisms/engine-status";
import { RulesAtAGlanceCard } from "@/components/dashboard/organisms/rules-at-a-glance-card";
import { DecisionVolumeCard } from "@/components/dashboard/organisms/decision-volume-card";
import { RecentActivityCard } from "@/components/dashboard/organisms/recent-activity-card";
import { ChannelsCard } from "@/components/dashboard/organisms/channels-card";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";
import type {
  EngineStatusData,
  ContractData,
} from "@/components/dashboard/organisms/engine-status";
import type { RuleCounts } from "@/components/dashboard/molecules/mode-breakdown";
import type { DayVolume } from "@/components/dashboard/molecules/volume-chart";
import type { ActivityItem } from "@/components/dashboard/molecules/recent-activity";

const CHANNELS = ["web", "mobile", "api", "branch", "atm", "callcenter"];
const DASHBOARD_BREADCRUMBS = [{ label: "Red Velvet" }, { label: "Overview" }];

interface DashboardTemplateProps {
  engine: EngineStatusData;
  ruleCounts: RuleCounts;
  dailyVolume: DayVolume[];
  recentActivity: ActivityItem[];
  contract: ContractData;
}

export function DashboardTemplate({
  engine,
  ruleCounts,
  dailyVolume,
  recentActivity,
  contract,
}: DashboardTemplateProps) {
  return (
    <AppShell
      sidebar={
        <Sidebar
          currentRoute="dashboard"
          navItems={NAV_ITEMS}
          adminItems={ADMIN_ITEMS}
          footer={<SidebarFooter />}
        />
      }
      topbar={
        <Topbar
          breadcrumbs={DASHBOARD_BREADCRUMBS}
          engineStatus={{
            ready: engine.status === "ready",
            rulesCount: engine.rules_loaded,
          }}
        />
      }
    >
      <LiveRefresher intervalMs={10000} />

      <DashboardHeader />

      <EngineStatus engine={engine} contract={contract} />

      <div
        className="split grid gap-6"
        style={{ gridTemplateColumns: "1fr 384px" }}
      >
        <div className="stack flex flex-col gap-6">
          <RulesAtAGlanceCard ruleCounts={ruleCounts} />
          <DecisionVolumeCard dailyVolume={dailyVolume} />
        </div>

        <div className="stack flex flex-col gap-6">
          <RecentActivityCard items={recentActivity} />
          <ChannelsCard channels={CHANNELS} />
        </div>
      </div>
    </AppShell>
  );
}
