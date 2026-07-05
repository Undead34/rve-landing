import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card"
import { VolumeChart } from "@/components/dashboard/molecules/volume-chart"
import { TimeRangeSegmented } from "@/components/dashboard/molecules/time-range-segmented"
import type { DayVolume } from "@/components/dashboard/molecules/volume-chart"

interface DecisionVolumeCardProps {
  dailyVolume: DayVolume[]
}

export function DecisionVolumeCard({ dailyVolume }: DecisionVolumeCardProps) {
  const totalEvents = dailyVolume.reduce(
    (s, d) => s + d.allow + d.review + d.block + d.tag_only,
    0,
  )
  const totalReviews = dailyVolume.reduce((s, d) => s + d.review, 0)
  const totalBlocks = dailyVolume.reduce((s, d) => s + d.block, 0)

  return (
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
  )
}
