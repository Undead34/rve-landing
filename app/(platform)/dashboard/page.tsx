import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { EngineStatus } from "@/components/dashboard/engine-status";
import { ModeBreakdown } from "@/components/dashboard/mode-breakdown";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DashboardHeaderActions,
  OpenLibraryButton,
  TimeRangeSegmented,
} from "@/components/dashboard/dashboard-actions";
import {
  engine,
  ruleCounts,
  dailyVolume,
  recentActivity,
  contract,
} from "./_lib/mock-data";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";

const CHANNELS = ["web", "mobile", "api", "branch", "atm", "callcenter"];

export default function DashboardPage() {
  const total =
    ruleCounts.active +
    ruleCounts.staged +
    ruleCounts.suspended +
    ruleCounts.deactivated;
  const totalEvents = dailyVolume.reduce(
    (s, d) => s + d.allow + d.review + d.block + d.tag_only,
    0,
  );
  const totalReviews = dailyVolume.reduce((s, d) => s + d.review, 0);
  const totalBlocks = dailyVolume.reduce((s, d) => s + d.block, 0);

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
          breadcrumbs={[{ label: "Red Velvet" }, { label: "Overview" }]}
          engineStatus={{ ready: true, rulesCount: engine.rules_loaded }}
        />
      }
    >
      <div className="page-header flex items-center justify-between mb-6">
        <div>
          <h1 className="text-(--fs-xl) font-semibold tracking-[-0.02em] m-0">
            Overview
          </h1>
          <p className="text-(--fg-muted) mt-1 m-0">
            Engine status, rule inventory, and recent activity across all
            channels.
          </p>
        </div>
        <DashboardHeaderActions />
      </div>

      <EngineStatus engine={engine} contract={contract} />

      <div
        className="split grid gap-6"
        style={{ gridTemplateColumns: "1fr 384px" }}
      >
        <div className="stack flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle subtitle={`${total} rules in repo · color by mode`}>
                Rules at a glance
              </CardTitle>
              <OpenLibraryButton />
            </CardHeader>
            <CardBody>
              <ModeBreakdown counts={ruleCounts} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle
                subtitle={`${totalEvents.toLocaleString()} events · ${totalReviews.toLocaleString()} reviews · ${totalBlocks.toLocaleString()} blocks`}
              >
                Decision volume — last 14 days
              </CardTitle>
              <TimeRangeSegmented />
            </CardHeader>
            <CardBody>
              <VolumeChart data={dailyVolume} />
            </CardBody>
          </Card>
        </div>

        <div className="stack flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <button className="w-6.5 h-6.5 grid place-items-center rounded-sm border-none bg-transparent text-(--fg-muted) hover:bg-(--bg-hover) hover:text-foreground cursor-pointer transition-colors">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </CardHeader>
            <CardBody noPad>
              <RecentActivity items={recentActivity} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channels</CardTitle>
              <span className="text-[12px] text-(--fg-muted)">
                {CHANNELS.length} configured
              </span>
            </CardHeader>
            <CardBody className="p-4!">
              <div className="flex flex-wrap gap-1.5">
                {CHANNELS.map((c) => (
                  <Badge key={c} kind="neutral" mono>
                    {c}
                  </Badge>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
