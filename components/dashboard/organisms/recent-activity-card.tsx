import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card"
import { RecentActivity } from "@/components/dashboard/molecules/recent-activity"
import type { ActivityItem } from "@/components/dashboard/molecules/recent-activity"

interface RecentActivityCardProps {
  items: ActivityItem[]
}

export function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <button
          type="button"
          className="w-6.5 h-6.5 grid place-items-center rounded-sm border-none bg-transparent text-(--fg-muted) hover:bg-(--bg-hover) hover:text-foreground cursor-pointer transition-colors"
        >
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
        <RecentActivity items={items} />
      </CardBody>
    </Card>
  )
}
