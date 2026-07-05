"use client";

import { IconButton } from "@/components/ui/button";
import { useCommandPaletteStore } from "@/lib/stores/command-palette-store";

export function CommandPaletteTriggers() {
  const toggle = useCommandPaletteStore((s) => s.toggle);
  return (
    <>
      <IconButton icon="search" title="Search" onClick={toggle} />
      <IconButton icon="command" title="Command palette" onClick={toggle} />
    </>
  );
}
