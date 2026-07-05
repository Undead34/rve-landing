"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/tabs";

export function TimeRangeSegmented() {
  const [segment, setSegment] = useState("14d");
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
  );
}
