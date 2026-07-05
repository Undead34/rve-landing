"use client";

import { Icon } from "@/components/ui/icon";
import { PanelsMenuButton } from "./panels-menu";
import type { BuilderPanelsController } from "./use-builder-panels";

interface EmptyTabsetProps {
  controller: BuilderPanelsController;
}

export function EmptyTabset({ controller }: EmptyTabsetProps) {
  return (
    <div className="flex min-h-0 flex-1 w-full items-center justify-center p-8">
      <div className="flex w-full max-w-[520px] flex-col items-center text-center">
        <div className="grid h-11 w-11 place-items-center rounded-full border border-(--border-strong) bg-(--bg-inset) text-(--fg-subtle)">
          <Icon name="grid" size={18} />
        </div>
        <h2 className="mb-0 mt-4 text-[18px] font-semibold tracking-[-0.02em]">
          Everything is closed
        </h2>
        <p className="mb-0 mt-2 max-w-[420px] text-[13px] leading-relaxed text-(--fg-muted)">
          All editor tabs were closed. Reopen any section or workspace panel
          from the panels menu.
        </p>
        <div className="mt-5 flex justify-center">
          <PanelsMenuButton controller={controller} variant="empty" />
        </div>
      </div>
    </div>
  );
}
