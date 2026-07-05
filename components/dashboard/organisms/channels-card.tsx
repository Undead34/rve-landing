import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ChannelsCardProps {
  channels: string[]
}

export function ChannelsCard({ channels }: ChannelsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channels</CardTitle>
        <span className="text-[12px] text-(--fg-muted)">
          {channels.length} configured
        </span>
      </CardHeader>
      <CardBody className="p-4!">
        <div className="flex flex-wrap gap-1.5">
          {channels.map((c) => (
            <Badge key={c} kind="neutral" mono>
              {c}
            </Badge>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
