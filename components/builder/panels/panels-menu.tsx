"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icon";
import type {
  BuilderPanelsController,
  PanelToggle,
} from "./use-builder-panels";

type PanelsMenuVariant = "toolbar" | "empty";

const triggerClasses: Record<PanelsMenuVariant, string> = {
  toolbar:
    "inline-flex items-center gap-2 rounded-(--radius-md) border border-(--border-strong) bg-(--bg-elev) px-2.5 py-1 text-[12px] font-semibold text-(--fg-muted) hover:bg-(--bg-hover) hover:text-(--fg) cursor-pointer",
  empty:
    "inline-flex items-center gap-2 rounded-(--radius-md) border border-(--border-strong) bg-(--bg-elev) px-3 py-2 text-[13px] font-semibold text-(--fg) hover:bg-(--bg-hover) cursor-pointer",
};

const triggerIconSize: Record<PanelsMenuVariant, number> = {
  toolbar: 14,
  empty: 16,
};

export function PanelsMenuButton({
  controller,
  variant = "toolbar",
}: {
  controller: BuilderPanelsController;
  variant?: PanelsMenuVariant;
}) {
  const { toggles, togglePanel } = controller;
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, right: window.innerWidth - r.right });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // The menu is position:fixed off the trigger's rect — close instead of
    // drifting when a resize moves the trigger out from under it.
    const onResize = () => setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const sections = toggles.filter((t) => t.slot === "section");
  const aux = toggles.filter((t) => t.slot !== "section");

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Show or hide panels"
        aria-haspopup="menu"
        aria-expanded={open}
        className={triggerClasses[variant]}
        style={variant === "toolbar" ? { margin: "0 4px" } : undefined}
      >
        <Icon name="grid" size={triggerIconSize[variant]} />
        Panels
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Show or hide panels"
            style={{
              position: "fixed",
              top: coords.top,
              right: coords.right,
              zIndex: 1000,
            }}
            className="w-56 overflow-hidden rounded-lg border border-(--border) bg-(--bg-elev) py-1 shadow-(--shadow-lg)"
          >
            {aux.length > 0 && (
              <PanelGroup
                title="Workspace panels"
                items={aux}
                onToggle={togglePanel}
              />
            )}
            {sections.length > 0 && (
              <PanelGroup
                title="Editor sections"
                items={sections}
                onToggle={togglePanel}
              />
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

function PanelGroup({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: PanelToggle[];
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-(--fg-subtle)">
        {title}
      </div>
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          role="menuitemcheckbox"
          aria-checked={t.visible}
          onClick={() => onToggle(t.id)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-(--fg) hover:bg-(--bg-hover) cursor-pointer"
        >
          <span
            className="grid h-3.5 w-3.5 place-items-center rounded-sm border"
            style={{
              borderColor: t.visible ? "var(--accent)" : "var(--border-strong)",
              background: t.visible ? "var(--accent)" : "transparent",
              color: "white",
            }}
          >
            {t.visible && <Icon name="check" size={10} stroke={2.5} />}
          </span>
          <span className="flex-1">{t.title}</span>
        </button>
      ))}
    </>
  );
}
