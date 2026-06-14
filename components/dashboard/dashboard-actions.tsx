"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Segmented } from "@/components/ui/tabs"

interface DashboardHeaderActionsProps {
  onReload?: () => void
  isReloading?: boolean
}

export function DashboardHeaderActions({ onReload, isReloading }: DashboardHeaderActionsProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <Button icon="refresh" onClick={onReload} disabled={isReloading}>
        {isReloading ? "Reloading..." : "Reload engine"}
      </Button>
      <Button
        kind="accent"
        icon="plus"
        onClick={() => router.push("/rules/builder")}
      >
        New rule
      </Button>
    </div>
  )
}

export function OpenLibraryButton() {
  const router = useRouter()
  return (
    <Button
      size="sm"
      iconAfter="arrow-right"
      onClick={() => router.push("/rules")}
    >
      Open library
    </Button>
  )
}

export function TimeRangeSegmented() {
  const [segment, setSegment] = useState("14d")
  return (
    <Segmented
      value={segment}
      onChange={setSegment}
      options={[
        { value: "24h", label: "24h" },
        { value: "7d", label: "7d" },
        { value: "14d", label: "14d" },
        { value: "30d", label: "30d" },
      ]}
    />
  )
}
