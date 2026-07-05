"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface LiveRefresherProps {
  intervalMs?: number;
}

export function LiveRefresher({ intervalMs = 10000 }: LiveRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
