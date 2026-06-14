"use client";

import { useMemo, useCallback, useState, useEffect, useRef, forwardRef } from "react";
import type { ReactElement } from "react";
import { useFields } from "@/lib/hooks/useFields";
import { useRuleStore } from "@/lib/stores/rule-store";
import { useFieldsStore } from "@/lib/stores/fields-store";
import type { FieldDef } from "@/lib/domain/types";
import { OPERATOR_MAP_BY_TYPE } from "@/lib/domain/types";
import type { Condition } from "@/lib/stores/rule-store";
import { treeToJsonLogic as _treeToJsonLogic } from "@/lib/utils/jsonlogic";

// react-querybuilder imports
import { QueryBuilder } from "react-querybuilder";
import type {
  ActionProps,
  FieldSelectorProps,
  RuleGroupType,
  ValueEditorProps,
  DragHandleProps,
  CombinatorSelectorProps,
} from "react-querybuilder";
import { QueryBuilderDndWithoutProvider } from "@react-querybuilder/dnd";
import * as ReactDnD from "react-dnd";
import * as ReactDndHtml5Backend from "react-dnd-html5-backend";
import { useDragLayer, useDrop, type DragLayerMonitor } from "react-dnd";
import { Icon } from "../ui/icon";

interface ConditionsSectionProps {
  tree: Condition;
  onChange: (tree: Condition) => void;
}

function defaultOp(field: FieldDef): string {
  return OPERATOR_MAP_BY_TYPE[field.type]?.[0] ?? "=";
}

function defaultValue(field: FieldDef): string {
  if (field.type === "boolean_like") return "true";
  if (field.type === "enum" && field.allowed_values?.length)
    return field.allowed_values[0];
  return "";
}

// Convert from Condition (Zustand store format) to RuleGroupType (react-querybuilder format)
function conditionToRuleGroup(cond: Condition): RuleGroupType {
  if (!cond) {
    return { combinator: "and", rules: [] };
  }

  const combinator = (cond.op || "and").toLowerCase();
  
  if (cond.type === "group" || cond.children) {
    return {
      combinator,
      rules: (cond.children || []).map((child) => {
        if (child.type === "group" || child.children) {
          return conditionToRuleGroup(child);
        } else {
          return {
            field: child.field || "",
            operator: child.op || "=",
            value: child.value ?? "",
          };
        }
      }),
    };
  }

  return {
    combinator: "and",
    rules: [
      {
        field: cond.field || "",
        operator: cond.op || "=",
        value: cond.value ?? "",
      },
    ],
  };
}

// Convert from RuleGroupType (react-querybuilder format) to Condition (Zustand store format)
function ruleGroupToCondition(group: RuleGroupType): Condition {
  return {
    type: "group",
    op: (group.combinator || "AND").toUpperCase() as "AND" | "OR",
    children: (group.rules || []).map((rule) => {
      if ("rules" in rule) {
        return ruleGroupToCondition(rule);
      } else {
        return {
          type: "cond",
          field: rule.field,
          op: rule.operator,
          value: String(rule.value ?? ""),
        };
      }
    }),
  };
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

// Custom Drag and Drop Action buttons for react-querybuilder
const SidebarAwareAddRuleAction: React.FC<ActionProps> = (props) => {
  const isDraggingField = useDragLayer(
    (monitor: DragLayerMonitor) =>
      monitor.isDragging() &&
      monitor.getItemType() === "field" &&
      Boolean((monitor.getItem() as { field: { path: string } })?.field?.path)
  );

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: "field",
      drop: (item: { field: { path: string } }) => {
        props.handleOnClick(undefined, {
          source: "sidebar",
          fieldName: item.field.path,
          mode: "rule",
        });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [props.handleOnClick]
  );

  return (
    <div
      ref={(node) => {
        dropRef(node);
      }}
      className={
        isOver && canDrop
          ? "rounded-md ring-2 ring-(--accent) bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-all"
          : "transition-all"
      }
    >
      {isDraggingField ? (
        <div className="border border-dashed border-(--accent) bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-(--accent) rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer flex items-center gap-1">
          <Icon name="plus" size={12} />
          <span>Condition</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => props.handleOnClick(e)}
          title={props.title}
          disabled={props.disabled}
          className="icon-btn flex items-center justify-center border-none bg-transparent hover:bg-(--bg-hover) rounded cursor-pointer"
          style={{ width: 26, height: 26 }}
        >
          <Icon name="plus" size={12} />
        </button>
      )}
    </div>
  );
};

const SidebarAwareAddGroupAction: React.FC<ActionProps> = (props) => {
  const isDraggingField = useDragLayer(
    (monitor: DragLayerMonitor) =>
      monitor.isDragging() &&
      monitor.getItemType() === "field" &&
      Boolean((monitor.getItem() as { field: { path: string } })?.field?.path)
  );

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: "field",
      drop: (item: { field: { path: string } }) => {
        props.handleOnClick(undefined, {
          source: "sidebar",
          fieldName: item.field.path,
          mode: "group",
        });
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [props.handleOnClick]
  );

  return (
    <div
      ref={(node) => {
        dropRef(node);
      }}
      className={
        isOver && canDrop
          ? "rounded-md ring-2 ring-(--accent) bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition-all"
          : "transition-all"
      }
    >
      {isDraggingField ? (
        <div className="border border-dashed border-(--accent) bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-(--accent) rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer flex items-center gap-1">
          <span>+ Group</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => props.handleOnClick(e)}
          title={props.title}
          disabled={props.disabled}
          className="btn sm ghost"
          style={{ padding: "2px 8px" }}
        >
          + group
        </button>
      )}
    </div>
  );
};

const DroppableFieldSelector: React.FC<FieldSelectorProps> = (props) => {
  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: "field",
      drop: (item: { field: { path: string } }) => {
        if (item.field?.path) {
          props.handleOnChange(item.field.path);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [props.handleOnChange]
  );

  return (
    <div
      ref={(node) => {
        dropRef(node);
      }}
      className={
        isOver && canDrop
          ? "rounded-md ring-2 ring-blue-400 ring-offset-1 focus-within:ring-2"
          : undefined
      }
    >
      <select
        data-testid={props.testID}
        className={props.className}
        value={String(props.value ?? "")}
        title={props.title}
        disabled={props.disabled}
        onChange={(event) => props.handleOnChange(event.target.value)}
      >
        {props.options.map((option: { label: string; options?: Array<{ name: string; value: string; label: string }>; name?: string; value?: string }) => {
          if (option.options && Array.isArray(option.options)) {
            return (
              <optgroup key={option.label} label={option.label}>
                {option.options.map((subOption) => (
                  <option
                    key={subOption.name || subOption.value}
                    value={subOption.name || subOption.value}
                  >
                    {subOption.label || subOption.name || subOption.value}
                  </option>
                ))}
              </optgroup>
            );
          }

          return (
            <option key={option.name || option.value} value={option.name || option.value}>
              {option.label || option.name || option.value}
            </option>
          );
        })}
      </select>
    </div>
  );
};

const CustomDragHandle = forwardRef<HTMLElement, DragHandleProps>(
  ({ title, disabled }, ref) => {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}

        title={title}
        className={`cursor-grab active:cursor-grabbing text-(--fg-subtle) hover:text-(--fg) p-1 flex items-center justify-center ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <Icon name="drag" size={12} stroke={1.5} />
      </div>
    );
  }
);
CustomDragHandle.displayName = "CustomDragHandle";

const CustomCombinatorSelector: React.FC<CombinatorSelectorProps> = (props) => {
  const isOr = props.value === "or" || props.value === "OR";

  const handleToggle = () => {
    const nextVal = isOr ? "and" : "or";
    props.handleOnChange(nextVal);
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
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
      {String(props.value || "and").toUpperCase()}
    </button>
  );
};

const CustomRemoveGroupAction: React.FC<ActionProps> = (props) => {
  return (
    <button
      type="button"
      onClick={(e) => props.handleOnClick(e)}
      title={props.title}
      disabled={props.disabled}
      className="icon-btn text-(--fg-subtle) hover:text-(--accent) transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
      style={{ width: 26, height: 26 }}
    >
      <Icon name="x" size={12} />
    </button>
  );
};

const CustomRemoveRuleAction: React.FC<ActionProps> = (props) => {
  return (
    <button
      type="button"
      onClick={(e) => props.handleOnClick(e)}
      title={props.title}
      disabled={props.disabled}
      className="icon-btn text-(--fg-subtle) hover:text-(--accent) transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
      style={{ width: 26, height: 26 }}
    >
      <Icon name="x" size={12} />
    </button>
  );
};

function ConditionsNested({
  tree,
  onChange,
}: {
  tree: Condition;
  onChange: (t: Condition) => void;
}) {
  const fields = useFieldsStore((s) => s.fields);

  // Group fields for querybuilder option group structure
  const qbFields = useMemo(() => {
    const groupsMap = new Map<string, { name: string; label: string; dataType: string; inputType: string; valueEditorType?: string; values?: { name: string; label: string }[] }[]>();
    fields.forEach((field) => {
      const parts = field.path.split(".");
      const groupName = parts.length > 1 ? parts[0] : "Other";
      const groupLabel = groupName.charAt(0).toUpperCase() + groupName.slice(1);

      const isNumber = field.type === "number";
      const isEnum = field.type === "enum" || field.type === "boolean_like" || !!field.allowed_values;
      const values = (field.allowed_values || []).map((v) => ({
        name: v,
        label: v,
      }));

      const mappedField = {
        name: field.path,
        label: field.description || field.path,
        dataType: field.type,
        inputType: isNumber ? "number" : "text",
        valueEditorType: isEnum ? "select" : undefined,
        values: values.length > 0 ? values : undefined,
      };

      if (!groupsMap.has(groupLabel)) {
        groupsMap.set(groupLabel, []);
      }
      groupsMap.get(groupLabel)!.push(mappedField);
    });

    return Array.from(groupsMap.entries()).map(([label, options]) => ({
      label,
      options,
    }));
  }, [fields]);

  // Convert incoming store condition to querybuilder format
  const query = useMemo(() => conditionToRuleGroup(tree), [tree]);

  // Convert updated querybuilder format back to store condition
  const handleQueryChange = useCallback((newQuery: RuleGroupType) => {
    const nextTree = ruleGroupToCondition(newQuery);
    onChange(nextTree);
  }, [onChange]);

  return (
    <div className="custom-query-builder h-full">
      <QueryBuilderDndWithoutProvider dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
        <QueryBuilder
          fields={qbFields}
          query={query}
          onQueryChange={handleQueryChange}
          getOperators={(fieldName) => {
            const field = fields.find((f) => f.path === fieldName);
            const operators = field
              ? OPERATOR_MAP_BY_TYPE[field.type] ?? ["=", "≠", ">", "<"]
              : ["=", "≠", ">", "<"];
            return operators.map((op) => ({ name: op, value: op, label: op }));
          }}
          resetOnFieldChange
          onAddRule={(rule, _parentPath, _query, context) => {
            const ctx = context as Record<string, unknown>;
            if (ctx?.source === "sidebar" && ctx.fieldName) {
              const field = fields.find((f) => f.path === ctx.fieldName);
              if (!field) return true;
              return {
                ...rule,
                field: field.path,
                operator: defaultOp(field),
                value: defaultValue(field),
              };
            }
            return true;
          }}
          onAddGroup={(ruleGroup, _parentPath, _query, context) => {
            const ctx = context as Record<string, unknown>;
            if (ctx?.source === "sidebar" && ctx.fieldName) {
              const field = fields.find((f) => f.path === ctx.fieldName);
              if (!field) return true;
              return {
                ...ruleGroup,
                rules: [
                  {
                    field: field.path,
                    operator: defaultOp(field),
                    value: defaultValue(field),
                  },
                ],
              };
            }
            return true;
          }}
          controlClassnames={{
            queryBuilder: "queryBuilder-container",
            ruleGroup:
              "bg-(--bg-elev) border rounded-lg p-3.5 shadow-sm space-y-2.5 relative",
            header:
              "flex flex-wrap md:flex-nowrap items-center gap-3 mb-3",
            combinators:
              "bg-(--bg-inset) border border-(--border-strong) rounded-md py-1 px-3 text-xs font-mono font-bold uppercase tracking-wider text-(--fg) hover:bg-(--bg-hover) transition-colors cursor-pointer outline-none",
            addRule:
              "bg-transparent text-(--fg) border border-(--border-strong) hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/20 rounded-md px-3 py-1.5 text-xs font-bold transition-all shadow-sm ml-auto cursor-pointer outline-none",
            addGroup:
              "bg-transparent text-(--fg) border border-(--border-strong) hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/20 rounded-md px-3 py-1.5 text-xs font-bold transition-all shadow-sm ml-2 cursor-pointer outline-none",
            removeGroup:
              "text-(--fg-subtle) hover:text-red-600 hover:bg-red-50/20 rounded p-1.5 transition-colors cursor-pointer border-none bg-transparent ml-2 outline-none",
            body:
              "border-t border-transparent pt-1 space-y-2",
            rule:
              "grid grid-cols-[auto_minmax(180px,1.4fr)_minmax(80px,0.6fr)_minmax(140px,1.4fr)_auto] gap-1.5 items-center p-1.5 bg-(--bg-subtle) border border-(--border-faint) rounded-md shadow-sm hover:shadow-md transition-all relative",
            fields:
              "select mono w-full py-1.5 px-2.5",
            operators:
              "select mono w-full py-1.5 px-2",
            value:
              "input mono w-full py-1.5 px-2.5",
            removeRule:
              "text-(--fg-subtle) hover:text-red-500 p-1.5 ml-auto transition-colors cursor-pointer border-none bg-transparent outline-none",
          }}
          controlElements={{
            fieldSelector: DroppableFieldSelector,
            addRuleAction: SidebarAwareAddRuleAction,
            addGroupAction: SidebarAwareAddGroupAction,
            valueEditor: CustomValueEditor,
            combinatorSelector: CustomCombinatorSelector,
            dragHandle: CustomDragHandle,
            removeGroupAction: CustomRemoveGroupAction,
            removeRuleAction: CustomRemoveRuleAction,
          }}
        />
      </QueryBuilderDndWithoutProvider>
    </div>
  );
}

const CustomValueEditor: React.FC<ValueEditorProps> = (props) => {
  const { value, handleOnChange, inputType, type, values, fieldData } = props;

  if (fieldData?.dataType === "ip") {
    return <IPInput value={String(value ?? "")} onChange={handleOnChange} />;
  }

  // Select Dropdown (Enum / Boolean)
  if ((values && values.length > 0) || type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => handleOnChange(e.target.value)}
        className="select mono w-full"
      >
        <option value="" disabled className="text-(--fg-muted)">
          Select...
        </option>
        {values &&
          values.map((v) => (
            <option key={String(v.name ?? v.value ?? "")} value={String(v.name ?? v.value ?? "")}>
              {String(v.label ?? v.name ?? v.value ?? "")}
            </option>
          ))}
      </select>
    );
  }

  // Normal input
  const isNumber = inputType === "number" || fieldData?.dataType === "number";

  return (
    <input
      value={value ?? ""}
      type={isNumber ? "number" : "text"}
      onChange={(e) => {
        if (!isNumber) {
          handleOnChange(e.target.value);
          return;
        }
        const next = e.target.value.trim();
        if (!next) {
          handleOnChange("");
          return;
        }
        const parsed = Number(next);
        if (!Number.isNaN(parsed)) {
          handleOnChange(parsed);
        }
      }}
      className="input mono w-full"
      placeholder={isNumber ? "0" : "Value..."}
    />
  );
};

function IPInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parseIP = (v: string) => {
    const parts = v ? v.split(".") : ["", "", "", ""];
    return [parts[0] || "", parts[1] || "", parts[2] || "", parts[3] || ""];
  };

  const [segments, setSegments] = useState<string[]>(() => parseIP(value));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const current = segments.join(".");
    if (value && value !== current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSegments(parseIP(value));
    }
  }, [value, segments]);

  const updateSegment = (index: number, val: string) => {
    if (val.length > 3) return;
    if (val && !/^\d+$/.test(val)) return;
    if (val && parseInt(val) > 255) val = "255";

    const newSegments = [...segments];
    newSegments[index] = val;
    setSegments(newSegments);
    onChange(newSegments.join("."));

    if (val.length === 3 && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "." && index < 3) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
    if (e.key === "Backspace" && !segments[index] && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="inline-flex items-center border border-(--border-strong) rounded-md bg-(--bg-elev) px-2 shadow-sm transition-all focus-within:border-(--fg-muted) focus-within:ring-3 focus-within:ring-[color-mix(in_srgb,var(--fg-muted)_12%,transparent)]">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center">
          <input
            ref={(el) => {
              if (inputsRef.current) inputsRef.current[i] = el;
            }}
            type="text"
            value={seg}
            onChange={(e) => updateSegment(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-8 text-center border-none outline-none p-0 text-sm font-mono text-(--fg) placeholder-(--fg-muted) bg-transparent"
            placeholder="0"
          />
          {i < 3 && <span className="text-(--fg-muted) select-none pb-0.5 font-mono">.</span>}
        </span>
      ))}
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
