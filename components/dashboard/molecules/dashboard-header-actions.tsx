import { Button } from "@/components/ui/button"
import { ReloadEngineButton } from "@/components/dashboard/molecules/reload-engine-button"

export function DashboardHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ReloadEngineButton />
      <Button kind="accent" icon="plus" href="/rules/builder">
        New rule
      </Button>
    </div>
  )
}
