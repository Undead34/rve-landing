"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { reloadEngine } from "@/app/(platform)/dashboard/actions";

export function ReloadEngineButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReload = () => {
    startTransition(async () => {
      await reloadEngine();
      router.refresh();
    });
  };

  return (
    <Button icon="refresh" onClick={handleReload} disabled={isPending}>
      {isPending ? "Reloading..." : "Reload engine"}
    </Button>
  );
}
