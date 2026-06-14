"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import type { ReactElement } from "react";
import { useFields } from "@/lib/hooks/useFields";
import { useRuleStore } from "@/lib/stores/rule-store";
import { useFieldsStore } from "@/lib/stores/fields-store";
import type { FieldDef } from "@/lib/domain/types";
import { OPERATOR_MAP_BY_TYPE } from "@/lib/domain/types";
import type { Condition } from "@/lib/stores/rule-store";
import { treeToJsonLogic as _treeToJsonLogic } from "@/lib/utils/jsonlogic";
import { useDrag, useDrop } from "react-dnd";
import { Icon } from "../ui/icon";

interface ConditionsSectionProps {
  tree: Condition;
  onChange: (tree: Condition) => void;
}



export function ConditionsSection({
  tree,
  onChange,
}: ConditionsSectionProps) {
  const stats = useMemo(() => countConditions(tree), [tree]);
  const { fields, isLoading, error } = useFields();
  const activeTab = useRuleStore((s) => s.activeTab);
  const setActiveTab = useRuleStore((s) => s.setActiveTab);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] m-0 mb-1">
            Conditions
          </h2>
          <p className="text-[13px] text-(--fg-muted) m-0">
            Build the predicate that fires this rule.{" "}
            {stats.total} conditions across {stats.groups} groups.
            {isLoading && " Loading fields..."}
          </p>
        </div>

        <div className="flex gap-1 bg-(--bg-inset) p-0.5 rounded-lg">
          {([
            { id: "builder", label: "nested" },
            { id: "summary", label: "summary" },
            { id: "tree", label: "tree" },
            { id: "code", label: "code" },
          ] as const).map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveTab(v.id)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-md capitalize cursor-pointer border-none transition-all"
              style={{
                background: activeTab === v.id ? "var(--bg-elev)" : "transparent",
                color: activeTab === v.id ? "var(--fg)" : "var(--fg-muted)",
                boxShadow: activeTab === v.id ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-6 my-2 rounded-md border border-(--action-block) bg-(--action-block-bg) px-3 py-2 text-[12px] text-(--action-block) shrink-0">
          {error}
        </div>
      )}

      {isLoading && fields.length === 0 && (
        <div className="mx-6 my-2 rounded-md border border-(--border-strong) bg-(--bg-inset) px-3 py-6 text-center text-[13px] text-(--fg-muted) shrink-0">
          Loading field catalog from backend...
        </div>
      )}

      {activeTab === "builder" && (
        <div className="p-6 overflow-auto flex-1 min-h-0 border-t border-(--border)">
          <ConditionsNested tree={tree} onChange={onChange} />
        </div>
      )}

      {activeTab === "tree" && (
        <div className="flex-1 overflow-auto p-6 min-h-0 border-t border-(--border)">
          <ConditionsTreeView tree={tree} />
        </div>
      )}
      {activeTab === "code" && (
        <div className="flex-1 overflow-auto p-6 min-h-0 border-t border-(--border)">
          <ConditionsCodeView tree={tree} />
        </div>
      )}
      {activeTab === "summary" && (
        <div className="flex-1 overflow-auto p-6 min-h-0 border-t border-(--border)">
          <ConditionsSummary tree={tree} />
        </div>
      )}
    </div>
  );
}

function countConditions(node: Condition): { total: number; groups: number } {
  let total = 0;
  let groups = 0;
  const walk = (n: Condition) => {
    if (!n) return;
    if (n.type === "cond" || n.field) total++;
    if (n.op === "AND" || n.op === "OR" || n.children) {
      groups++;
      (n.children || []).forEach(walk);
    }
  };
  walk(node);
  return { total, groups };
}

function getParentAndIndex(root: Condition, path: number[]): { parent: Condition; index: number } {
  let curr = root;
  for (let i = 0; i < path.length - 1; i++) {
    if (!curr.children) throw new Error("Invalid path");
    curr = curr.children[path[i]];
  }
  return { parent: curr, index: path[path.length - 1] };
}

export function moveNode(
  tree: Condition,
  fromPath: number[],
  toPath: number[],
  position: "before" | "after" | "inside"
): Condition {
  const newTree = JSON.parse(JSON.stringify(tree)) as Condition;

  const { parent: fromParent, index: fromIndex } = getParentAndIndex(newTree, fromPath);
  if (!fromParent.children) return tree;
  const [nodeToMove] = fromParent.children.splice(fromIndex, 1);

  const adjustedToPath = [...toPath];

  // Avoid dragging parent into its own child
  let isPrefix = true;
  if (fromPath.length <= toPath.length) {
    for (let i = 0; i < fromPath.length; i++) {
      if (fromPath[i] !== toPath[i]) {
        isPrefix = false;
        break;
      }
    }
  } else {
    isPrefix = false;
  }
  if (isPrefix) {
    return tree;
  }

  // Adjust target path due to previous removal
  let affected = true;
  for (let i = 0; i < fromPath.length - 1; i++) {
    if (fromPath[i] !== toPath[i]) {
      affected = false;
      break;
    }
  }
  if (affected) {
    const lastIdx = fromPath.length - 1;
    if (fromPath[lastIdx] < toPath[lastIdx]) {
      adjustedToPath[lastIdx]--;
    }
  }

  if (position === "inside") {
    let target = newTree;
    for (const idx of adjustedToPath) {
      if (!target.children) return tree;
      target = target.children[idx];
    }
    if (target.type !== "group") return tree;
    if (!target.children) target.children = [];
    target.children.push(nodeToMove);
  } else {
    const { parent: toParent, index: toIndex } = getParentAndIndex(newTree, adjustedToPath);
    if (!toParent.children) return tree;
    const insertIndex = position === "before" ? toIndex : toIndex + 1;
    toParent.children.splice(insertIndex, 0, nodeToMove);
  }

  return newTree;
}

export function insertField(
  tree: Condition,
  field: { path: string; description: string; type: string },
  toPath: number[],
  position: "before" | "after" | "inside"
): Condition {
  const newTree = JSON.parse(JSON.stringify(tree)) as Condition;
  const newCond: Condition = {
    type: "cond",
    field: field.path,
    op: "=",
    value: "",
  };

  if (position === "inside") {
    let target = newTree;
    for (const idx of toPath) {
      if (!target.children) return tree;
      target = target.children[idx];
    }
    if (target.type !== "group") return tree;
    if (!target.children) target.children = [];
    target.children.push(newCond);
  } else {
    const { parent: toParent, index: toIndex } = getParentAndIndex(newTree, toPath);
    if (!toParent.children) return tree;
    const insertIndex = position === "before" ? toIndex : toIndex + 1;
    toParent.children.splice(insertIndex, 0, newCond);
  }

  return newTree;
}

function ConditionsNested({
  tree,
  onChange,
}: {
  tree: Condition;
  onChange: (t: Condition) => void;
}) {
  const fields = useFieldsStore((s) => s.fields);

  const handleMoveNode = useCallback((fromPath: number[], toPath: number[], pos: "before" | "after" | "inside") => {
    const nextTree = moveNode(tree, fromPath, toPath, pos);
    onChange(nextTree);
  }, [tree, onChange]);

  const handleInsertField = useCallback((field: { path: string; description: string; type: string }, toPath: number[], pos: "before" | "after" | "inside") => {
    const nextTree = insertField(tree, field, toPath, pos);
    onChange(nextTree);
  }, [tree, onChange]);

  return (
    <div
      className="conditions-builder"
      style={{ padding: 16, borderRadius: 8 }}
    >
      <CondGroup
        node={tree}
        onChange={onChange}
        depth={0}
        fields={fields}
        path={[]}
        onMoveNode={handleMoveNode}
        onInsertField={handleInsertField}
      />
    </div>
  );
}

function CondGroup({
  node,
  onChange,
  onDelete,
  depth,
  fields,
  path,
  onMoveNode,
  onInsertField,
}: {
  node: Condition;
  onChange: (next: Condition) => void;
  onDelete?: () => void;
  depth: number;
  fields: FieldDef[];
  path: number[];
  onMoveNode: (fromPath: number[], toPath: number[], pos: "before" | "after" | "inside") => void;
  onInsertField: (field: { path: string; description: string; type: string }, toPath: number[], pos: "before" | "after" | "inside") => void;
}) {
  const isOr = node.op === "OR";
  const borderColor = isOr
    ? "color-mix(in srgb, var(--action-tag) 35%, var(--border))"
    : "var(--border-strong)";

  const updateChild = (idx: number, next: Condition | null) => {
    const children = [...(node.children || [])];
    if (next === null) children.splice(idx, 1);
    else children[idx] = next;
    onChange({ ...node, children });
  };

  const addCond = () =>
    onChange({
      ...node,
      children: [...(node.children || []), { type: "cond" as const, field: "", op: "=", value: "" }],
    });

  const addGroup = () =>
    onChange({
      ...node,
      children: [...(node.children || []), { type: "group" as const, op: "AND" as const, children: [] }],
    });

  const toggleOp = () => onChange({ ...node, op: isOr ? "AND" : "OR" });

  const ref = useRef<HTMLDivElement>(null);
  const dropPosGroupRef = useRef<"before" | "after">("before");

  // 1. Drag source for this group (if depth > 0)
  const [{ isDragging }, dragRef] = useDrag({
    type: "GROUP_ITEM",
    item: () => ({ path, type: "group" }),
    canDrag: depth > 0,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 2. Drop target on this group card (for before/after placement, only if depth > 0)
  const [{ isOverGroup, canDropGroup }, dropRefGroup] = useDrop({
    accept: ["COND_ITEM", "GROUP_ITEM", "field"],
    canDrop: () => depth > 0,
    hover: (item: unknown, monitor) => {
      if (!ref.current || depth === 0) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      dropPosGroupRef.current = hoverClientY < hoverMiddleY ? "before" : "after";
    },
    drop: (item: unknown, monitor) => {
      if (!ref.current || depth === 0) return;
      if (monitor.didDrop()) return;
      const pos = dropPosGroupRef.current;

      const f = (item as Record<string, unknown>)?.field;
      if (f) {
        onInsertField(f as { path: string; description: string; type: string }, path, pos);
        return;
      }
      const p = (item as Record<string, unknown>)?.path;
      if (p) {
        onMoveNode(p as number[], path, pos);
      }
    },
    collect: (monitor) => ({
      isOverGroup: monitor.isOver({ shallow: true }),
      canDropGroup: monitor.canDrop(),
    }),
  });

  // 3. Drop target on this group's children container (for inside/append placement)
  const [{ isOverChildren, canDropChildren }, dropRefChildren] = useDrop({
    accept: ["COND_ITEM", "GROUP_ITEM", "field"],
    drop: (item: unknown, monitor) => {
      if (monitor.didDrop()) return;

      const f = (item as Record<string, unknown>)?.field;
      if (f) {
        onInsertField(f as { path: string; description: string; type: string }, path, "inside");
        return;
      }
      const p = (item as Record<string, unknown>)?.path;
      if (p) {
        onMoveNode(p as number[], path, "inside");
      }
    },
    collect: (monitor) => ({
      isOverChildren: monitor.isOver({ shallow: true }),
      canDropChildren: monitor.canDrop(),
    }),
  });

  const showHighlight = isOverGroup && canDropGroup;

  return (
    <div
      ref={(node) => {
        if (depth > 0) {
          dropRefGroup(node);
          ref.current = node;
        }
      }}
      style={{
        background: "var(--bg-elev)",
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: 12,
        position: "relative",
        opacity: isDragging ? 0.3 : 1,
        outline: showHighlight ? "2px solid var(--accent)" : "none",
        outlineOffset: showHighlight ? 2 : 0,
        transition: "opacity 0.12s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        {depth > 0 && (
          <button
            ref={(node) => { dragRef(node); }}
            className="shrink-0 cursor-grab active:cursor-grabbing bg-transparent border-none text-(--fg-subtle) hover:text-(--fg) p-0"
            style={{ touchAction: "none" }}
            title="Drag group"
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
        )}

        <button
          onClick={toggleOp}
          style={{
            padding: "3px 10px",
            border: "1px solid currentColor",
            borderRadius: 4,
            background: isOr
              ? "color-mix(in srgb, var(--action-tag) 10%, transparent)"
              : "color-mix(in srgb, var(--fg) 6%, transparent)",
            color: isOr ? "var(--action-tag)" : "var(--fg)",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
          }}
        >
          {node.op}
        </button>
        <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
          {(node.children?.length || 0) === 0
            ? "Empty group"
            : `${node.children?.length || 0} ${(node.children?.length || 0) === 1 ? "child" : "children"}`}
          {depth === 0 && " \u00B7 root"}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button
            className="icon-btn"
            onClick={addCond}
            title="Add condition"
            style={{ width: 26, height: 26 }}
          >
            <Icon name="plus" size={12} />
          </button>
          {depth < 3 && (
            <button
              className="btn sm ghost"
              onClick={addGroup}
              style={{ padding: "2px 8px" }}
            >
              + group
            </button>
          )}
          {depth > 0 && onDelete && (
            <button
              className="icon-btn"
              onClick={onDelete}
              title="Remove group"
              style={{ width: 26, height: 26 }}
            >
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={(node) => {
          dropRefChildren(node);
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginLeft: 12,
          position: "relative",
          minHeight: (node.children?.length || 0) === 0 ? "auto" : "20px",
          padding: isOverChildren && canDropChildren ? "6px" : "0px",
          background: isOverChildren && canDropChildren ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
          borderRadius: 6,
          border: isOverChildren && canDropChildren ? "1px dashed var(--accent)" : "none",
          transition: "all 0.15s ease",
        }}
      >
        {(node.children?.length || 0) > 1 && !isOverChildren && (
          <div
            style={{
              position: "absolute",
              left: -10,
              top: 8,
              bottom: 8,
              width: 1,
              background: borderColor,
            }}
          />
        )}
        {!node.children || node.children.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              padding: "12px 0",
              textAlign: "center",
              color: "var(--fg-muted)",
              border: "1px dashed var(--border-strong)",
              borderRadius: 6,
            }}
          >
            No conditions yet. Click <Icon name="plus" size={10} /> to add one.
          </div>
        ) : (
          node.children.map((child, i) => {
            const childPath = [...path, i];
            return (
              <div key={i} style={{ position: "relative" }}>
                {(node.children?.length || 0) > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: -10,
                      top: 16,
                      width: 8,
                      height: 1,
                      background: borderColor,
                    }}
                  />
                )}
                {child.type === "group" ? (
                  <CondGroup
                    node={child}
                    onChange={(next) => updateChild(i, next)}
                    onDelete={() => updateChild(i, null)}
                    depth={depth + 1}
                    fields={fields}
                    path={childPath}
                    onMoveNode={onMoveNode}
                    onInsertField={onInsertField}
                  />
                ) : (
                  <Cond
                    cond={child}
                    onChange={(next) => updateChild(i, next)}
                    onDelete={() => updateChild(i, null)}
                    fields={fields}
                    path={childPath}
                    onMoveNode={onMoveNode}
                    onInsertField={onInsertField}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Cond({
  cond,
  onChange,
  onDelete,
  fields,
  path,
  onMoveNode,
  onInsertField,
}: {
  cond: Condition;
  onChange: (next: Condition) => void;
  onDelete: () => void;
  fields: FieldDef[];
  path: number[];
  onMoveNode: (fromPath: number[], toPath: number[], pos: "before" | "after" | "inside") => void;
  onInsertField: (field: { path: string; description: string; type: string }, toPath: number[], pos: "before" | "after" | "inside") => void;
}) {
  const fieldMeta = fields.find((f) => f.path === cond.field);
  const ops = fieldMeta
    ? (OPERATOR_MAP_BY_TYPE[fieldMeta.type] ?? ["=", "\u2260", ">", "<"])
    : ["=", "\u2260", ">", "<"];
  const isEnum = fieldMeta?.type === "enum" || fieldMeta?.type === "boolean_like";

  const ref = useRef<HTMLDivElement>(null);
  const dropPosRef = useRef<"before" | "after">("before");

  const [{ isDragging }, dragRef] = useDrag({
    type: "COND_ITEM",
    item: () => ({ path, type: "cond" }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: ["COND_ITEM", "GROUP_ITEM", "field"],
    hover: (item: unknown, monitor) => {
      if (!ref.current) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      dropPosRef.current = hoverClientY < hoverMiddleY ? "before" : "after";
    },
    drop: (item: unknown, monitor) => {
      if (!ref.current) return;
      if (monitor.didDrop()) return;
      const pos = dropPosRef.current;

      const f = (item as Record<string, unknown>)?.field;
      if (f) {
        onInsertField(f as { path: string; description: string; type: string }, path, pos);
        return;
      }
      const p = (item as Record<string, unknown>)?.path;
      if (p) {
        onMoveNode(p as number[], path, pos);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const showDropHighlight = isOver && canDrop;

  return (
    <div
      ref={(node) => {
        dropRef(node);
        ref.current = node;
      }}
      className="condition-row"
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(180px, 1.4fr) minmax(80px, 0.6fr) minmax(140px, 1.4fr) auto",
        gap: 6,
        alignItems: "center",
        padding: 6,
        background: "var(--bg-subtle)",
        border: "1px solid var(--border-faint)",
        borderRadius: 6,
        transition: "box-shadow 0.12s, border-color 0.12s, opacity 0.12s",
        opacity: isDragging ? 0.3 : 1,
        outline: showDropHighlight ? "2px solid var(--accent)" : "none",
        outlineOffset: showDropHighlight ? 2 : 0,
      }}
    >
      <button
        ref={(node) => { dragRef(node); }}
        className="shrink-0 cursor-grab active:cursor-grabbing bg-transparent border-none text-(--fg-subtle) hover:text-(--fg) p-0"
        style={{ touchAction: "none" }}
        title="Drag condition"
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

      <DroppableFieldSelect
        value={cond.field || ""}
        onChange={(v) => onChange({ ...cond, field: v, value: "" })}
        fields={fields}
      />
      <select
        className="select mono"
        style={{ padding: "5px 8px", width: "100%" }}
        value={cond.op}
        onChange={(e) => onChange({ ...cond, op: e.target.value })}
      >
        {ops.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {isEnum ? (
        <select
          className="select mono"
          style={{ padding: "5px 8px", width: "100%" }}
          value={cond.value || ""}
          onChange={(e) => onChange({ ...cond, value: e.target.value })}
        >
          <option value="">— value —</option>
          {(fieldMeta?.allowed_values || ["true", "false"]).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="input mono"
          style={{ padding: "5px 8px", width: "100%" }}
          value={cond.value || ""}
          onChange={(e) => onChange({ ...cond, value: e.target.value })}
          placeholder={fieldMeta?.type === "number" ? "number" : "value"}
        />
      )}
      <button
        className="icon-btn"
        onClick={onDelete}
        title="Remove condition"
        style={{ width: 26, height: 26 }}
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  );
}

function DroppableFieldSelect({
  value,
  onChange,
  fields,
}: {
  value: string;
  onChange: (v: string) => void;
  fields: FieldDef[];
}) {
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: "field",
      drop: (item: { field: { path: string } }) => {
        if (item.field?.path) {
          onChange(item.field.path);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onChange]
  );

  const groupedFields = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    fields.forEach((f) => {
      const parts = f.path.split(".");
      const group = parts.length > 1
        ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
        : "Other";
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(f);
    });
    return Array.from(map.entries());
  }, [fields]);

  return (
    <div
      ref={(node) => {
        dropRef(node);
      }}
      style={{
        borderRadius: 6,
        outline: isOver && canDrop ? "2px solid var(--accent)" : "none",
        outlineOffset: 2,
      }}
    >
      <select
        className="select mono"
        style={{ padding: "5px 8px", width: "100%" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— field —</option>
        {groupedFields.map(([group, groupFields]) => (
          <optgroup key={group} label={group}>
            {groupFields.map((f) => (
              <option key={f.path} value={f.path}>
                {f.description || f.path}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function ConditionsSummary({ tree }: { tree: Condition }) {
  const evaluationCondition = useRuleStore((s) => s.draft.evaluationCondition);
  const consequence = useRuleStore((s) => s.draft.enforcement);
  const fields = useFieldsStore((s) => s.fields);
  const [conditionMode, setConditionMode] = useState<"always" | "custom">(
    evaluationCondition === true ? "always" : "custom"
  );
  const [conditionDraft, setConditionDraft] = useState(
    evaluationCondition === true
      ? "true"
      : JSON.stringify(evaluationCondition, null, 2)
  );
  const [conditionError, setConditionError] = useState<string | null>(null);

  const setEvaluationCondition = useRuleStore((s) => s.setEvaluationCondition);

  const applyCustomCondition = (raw: string) => {
    setConditionDraft(raw);
    try {
      const parsed = JSON.parse(raw);
      setConditionError(null);
      setEvaluationCondition(parsed);
    } catch {
      setConditionError("Invalid JSON");
    }
  };

  const summary = useMemo(() => {
    const parts: string[] = [];
    const walk = (node: Condition) => {
      if (node.type === "cond" && node.field) {
        const meta = fields.find((f) => f.path === node.field);
        const label = meta?.description || node.field;
        parts.push(`${label} ${node.op} ${node.value}`);
      }
      if (node.children) {
        const combinator = node.op === "OR" ? "any" : "all";
        const childSummaries: string[] = [];
        const innerWalk = (n: Condition) => {
          if (n.type === "cond" && n.field) {
            const meta = fields.find((f) => f.path === n.field);
            childSummaries.push(`${meta?.description || n.field} ${n.op} ${n.value}`);
          }
          if (n.children) n.children.forEach(innerWalk);
        };
        node.children.forEach(innerWalk);
        if (childSummaries.length > 0) {
          parts.push(
            `${combinator === "any" ? "OR" : "AND"}: ${childSummaries.join(", ")}`
          );
        }
      }
    };
    walk(tree);
    return parts;
  }, [tree, fields]);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-(--bg-inset) p-4 rounded-lg border border-(--border)">
        <div className="text-[13px] font-semibold mb-2">Rule Logic</div>
        <div className="text-[12px] text-(--fg-muted) space-y-1">
          {summary.length > 0 ? (
            summary.map((s, i) => (
              <div key={i} className="font-mono">
                {s}
              </div>
            ))
          ) : (
            <div className="italic">No conditions defined</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-(--border) p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-[13px] font-semibold">Guard Condition</div>
            <div className="text-[11px] text-(--fg-muted)">
              Fast pre-filter before main logic.
            </div>
          </div>
          <div className="inline-flex rounded-md border border-(--border-strong) bg-(--bg-inset) p-0.5">
            <button
              onClick={() => {
                setConditionMode("always");
                setConditionError(null);
                setEvaluationCondition(true);
              }}
              className="rounded px-2.5 py-1 text-[11px] font-semibold cursor-pointer border-none transition-all"
              style={{
                background:
                  conditionMode === "always" ? "var(--bg-elev)" : "transparent",
                color:
                  conditionMode === "always" ? "var(--fg)" : "var(--fg-muted)",
                boxShadow:
                  conditionMode === "always"
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              Always true
            </button>
            <button
              onClick={() => {
                setConditionMode("custom");
                if (evaluationCondition === true) {
                  applyCustomCondition('{"==":[{"var":"event.type"},"withdrawal"]}');
                }
              }}
              className="rounded px-2.5 py-1 text-[11px] font-semibold cursor-pointer border-none transition-all"
              style={{
                background:
                  conditionMode === "custom" ? "var(--bg-elev)" : "transparent",
                color:
                  conditionMode === "custom" ? "var(--fg)" : "var(--fg-muted)",
                boxShadow:
                  conditionMode === "custom"
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              Custom JSON
            </button>
          </div>
        </div>

        {conditionMode === "custom" && (
          <div className="space-y-2">
            <textarea
              value={conditionDraft}
              onChange={(e) => setConditionDraft(e.target.value)}
              onBlur={(e) => applyCustomCondition(e.target.value)}
              className="h-20 w-full resize-y rounded-md border border-(--border-strong) bg-(--bg-elev) p-2 font-mono text-[12px]"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={() => applyCustomCondition(conditionDraft)}
                className="rounded-md border border-(--border-strong) px-2.5 py-1 text-[11px] font-semibold text-(--fg) bg-transparent hover:bg-(--bg-hover) cursor-pointer"
              >
                Apply
              </button>
              {conditionError ? (
                <span className="text-[11px] font-medium text-(--action-block)">
                  {conditionError}
                </span>
              ) : (
                <span className="text-[11px] text-(--action-allow)">
                  Condition valid
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-(--border) p-4">
        <div className="text-[13px] font-semibold mb-1">
          Enforcement
        </div>
        <div className="text-[12px] text-(--fg-muted)">
          Action:{" "}
          <span className="font-semibold text-(--fg)">
            {consequence.action.toUpperCase()}
          </span>{" "}
          · Score: {consequence.score_impact} · Severity:{" "}
          {consequence.severity}
        </div>
      </div>
    </div>
  );
}

function ConditionsTreeView({ tree }: { tree: Condition }) {
  const render = (node: Condition, depth: number): ReactElement => {
    if (node.type === "cond" || node.field) {
      return (
        <div className="flex gap-[6px] items-center px-2 py-1 font-mono text-[12px]">
          <span style={{ color: "var(--accent)" }}>
            {node.field || "—"}
          </span>
          <span className="text-[var(--fg-subtle)]">{node.op}</span>
          <span>{String(node.value)}</span>
        </div>
      );
    }
    const isOr = node.op === "OR";
    return (
      <div
        style={{
          borderLeft: `2px solid ${isOr ? "var(--action-tag)" : "var(--fg-muted)"}`,
          paddingLeft: 12,
          marginLeft: depth ? 6 : 0,
        }}
      >
        <div
          className="font-mono text-[11px] font-semibold"
          style={{
            color: isOr ? "var(--action-tag)" : "var(--fg-muted)",
          }}
        >
          {node.op}
        </div>
        {node.children?.map((c, i) => (
          <div key={i}>{render(c, depth + 1)}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[var(--bg-inset)] p-4 rounded-lg border border-[var(--border)]">
      {render(tree, 0)}
    </div>
  );
}

function ConditionsCodeView({ tree }: { tree: Condition }) {
  const codeView = useRuleStore((s) => s.codeView);
  const setCodeView = useRuleStore((s) => s.setCodeView);
  const evaluationCondition = useRuleStore((s) => s.draft.evaluationCondition);

  const jsonlogic = useMemo(() => {
    const logic = _treeToJsonLogic(tree as unknown as Record<string, unknown>);
    return JSON.stringify(
      {
        condition: evaluationCondition,
        logic,
      },
      null,
      2
    );
  }, [tree, evaluationCondition]);

  const lines: string[] = [];
  const ind = (n: number) => "  ".repeat(n);

  const walk = (node: Condition, depth: number) => {
    if (node.field !== undefined) {
      lines.push(`${ind(depth)}${node.field} ${node.op} "${node.value}"`);
      return;
    }
    const op = node.op;
    if (depth === 0) {
      node.children?.forEach((c, i) => {
        if (i > 0) lines.push(`${ind(depth)}${op}`);
        walk(c, depth);
      });
    } else {
      lines.push(`${ind(depth)}(`);
      node.children?.forEach((c, i) => {
        if (i > 0) lines.push(`${ind(depth + 1)}${op}`);
        walk(c, depth + 1);
      });
      lines.push(`${ind(depth)})`);
    }
  };

  walk(tree, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 bg-(--bg-inset) p-0.5 rounded-lg self-start">
        {(["condition", "jsonlogic"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setCodeView(v)}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-md capitalize cursor-pointer border-none transition-all"
            style={{
              background:
                codeView === v ? "var(--bg-elev)" : "transparent",
              color: codeView === v ? "var(--fg)" : "var(--fg-muted)",
              boxShadow:
                codeView === v ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {codeView === "condition" ? (
        <div className="bg-[var(--bg-inset)] p-4 rounded-lg border border-[var(--border)] font-mono text-[12px] leading-relaxed whitespace-pre overflow-x-auto">
          {lines.join("\n") || "No conditions defined"}
        </div>
      ) : (
        <div className="bg-[var(--bg-inset)] p-4 rounded-lg border border-[var(--border)] font-mono text-[12px] leading-relaxed whitespace-pre overflow-x-auto">
          {jsonlogic}
        </div>
      )}
    </div>
  );
}

export { _treeToJsonLogic as treeToJsonLogic };
