import { DashboardHeaderActions } from "@/components/dashboard/molecules/dashboard-header-actions"

export function DashboardHeader() {
  return (
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
  )
}
