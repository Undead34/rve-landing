import { DashboardTemplate } from "@/components/dashboard/templates/dashboard-template";
import { getEngineSnapshot } from "./actions";
import { dailyVolume, recentActivity, contract } from "./_lib/mock-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { engine, ruleCounts } = await getEngineSnapshot();

  return (
    <DashboardTemplate
      engine={engine}
      ruleCounts={ruleCounts}
      dailyVolume={dailyVolume}
      recentActivity={recentActivity}
      contract={contract}
    />
  );
}
