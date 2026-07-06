"use client";

import { useState, useMemo } from "react";
import { useDrag } from "react-dnd";
import { useFieldsStore } from "@/lib/stores/fields-store";
import { useRuleStore } from "@/lib/stores/rule-store";
import { Icon } from "../ui/icon";

interface FieldLibrarySidebarProps {
  /**
   * Whether fields can actually be dropped where you are. Dragging only makes
   * sense in the Conditions editor, so elsewhere the panel shows a hint with a
   * jump-to-Conditions action instead of a list you can't use.
   */
  isRelevant?: boolean;
}

export function FieldLibrarySidebar({
  isRelevant = true,
}: FieldLibrarySidebarProps) {
  const groups = useFieldsStore((s) => s.groups);
  const isLoading = useFieldsStore((s) => s.isLoading);
  const error = useFieldsStore((s) => s.error);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        fields: g.fields.filter(
          (f) =>
            f.path.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.type.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.fields.length > 0);
  }, [groups, search]);

  // Hooks above always run; the contextual hint is a pure render branch.
  if (!isRelevant) {
    return <FieldLibraryHint />;
  }

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-(--bg-elev) p-3">
      <h4 className="text-[13px] font-bold text-(--fg)">Field Library</h4>
      <p className="mt-0.5 text-[11px] text-(--fg-muted)">
        {isLoading
          ? "Loading fields..."
          : "Drag a field to the builder to add it."}
      </p>

      {error && (
        <div className="mt-2 rounded-md border border-(--action-block) bg-(--action-block-bg) px-2 py-1.5 text-[11px] text-(--action-block)">
          {error}
        </div>
      )}

      <div className="relative mt-2">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-(--fg-subtle)"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-(--border-strong) bg-(--bg-inset) py-1.5 pl-8 pr-2.5 text-[12px] outline-none placeholder:text-(--fg-subtle)"
          placeholder="Search fields..."
        />
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {filtered.map((g) => (
          <div key={g.group}>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-(--fg-subtle)">
              {g.group}
            </div>
            <div className="space-y-1">
              {g.fields.map((field) => (
                <FieldLibraryItem key={field.path} field={field} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-md border border-dashed border-(--border-strong) bg-(--bg-inset) px-2 py-4 text-center text-[11px] text-(--fg-muted)">
            {isLoading
              ? "Waiting for field metadata..."
              : "No fields match your search."}
          </div>
        )}
      </div>
    </aside>
  );
}

function FieldLibraryHint() {
  const setActiveSection = useRuleStore((s) => s.setActiveSection);

  return (
    <aside className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-(--bg-elev) p-6 text-center">
      <div className="grid h-9 w-9 place-items-center rounded-full border border-(--border-strong) bg-(--bg-inset) text-(--fg-subtle)">
        <Icon name="rule" size={16} />
      </div>
      <div className="text-[13px] font-medium text-(--fg)">Field Library</div>
      <p className="m-0 max-w-[220px] text-[11px] leading-relaxed text-(--fg-muted)">
        Fields are dragged into the{" "}
        <span className="font-medium text-(--fg)">Conditions</span> builder. Open
        it to browse and drop fields.
      </p>
      <button
        type="button"
        onClick={() => setActiveSection("conditions")}
        className="rounded-md border border-(--border-strong) bg-(--bg-elev) px-3 py-1.5 text-[12px] font-medium text-(--fg) hover:bg-(--bg-hover) cursor-pointer"
      >
        Go to Conditions
      </button>
    </aside>
  );
}

function FieldLibraryItem({
  field,
}: {
  field: { path: string; description: string; type: string };
}) {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: "field",
      item: { field },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [field],
  );

  return (
    <div
      className="flex items-center gap-1.5 rounded-md border border-(--border-faint) bg-(--bg-subtle) px-2 py-1.5 text-[12px] transition-all"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <button
        type="button"
        ref={(node) => {
          dragRef(node);
        }}
        className="shrink-0 cursor-grab active:cursor-grabbing bg-transparent border-none text-(--fg-subtle) hover:text-(--fg) p-0"
        style={{ touchAction: "none" }}
        title="Drag to builder"
      >
        <svg width="10" height="16" viewBox="0 0 12 20" fill="currentColor">
          <circle cx="4" cy="3" r="1.5" />
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="4" cy="13" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      <span className="flex-1 truncate font-medium text-(--fg)">
        {field.description || field.path}
      </span>
      <span className="shrink-0 rounded border border-(--border-faint) bg-(--bg-inset) px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide text-(--fg-subtle)">
        {field.type}
      </span>
    </div>
  );
}
