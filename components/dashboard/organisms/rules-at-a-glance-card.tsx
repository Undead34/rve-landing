import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card"
import { ModeBreakdown } from "@/components/dashboard/molecules/mode-breakdown"
import { OpenLibraryButton } from "@/components/dashboard/molecules/open-library-button"
import type { RuleCounts } from "@/components/dashboard/molecules/mode-breakdown"

interface RulesAtAGlanceCardProps {
  ruleCounts: RuleCounts
}

export function RulesAtAGlanceCard({ ruleCounts }: RulesAtAGlanceCardProps) {
  const total =
    ruleCounts.active +
    ruleCounts.staged +
    ruleCounts.suspended +
    ruleCounts.deactivated

  return (
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
  )
}
