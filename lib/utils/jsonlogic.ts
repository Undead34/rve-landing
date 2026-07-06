import type { Condition } from "@/lib/stores/rule-store";
import { createConditionId } from "@/lib/stores/rule-store";

export function treeToJsonLogic(
  tree: Record<string, unknown>,
): Record<string, unknown> {
  if (!tree || !tree.children) {
    return { "==": [{ var: "1" }, "1"] };
  }

  const children = tree.children as Array<Record<string, unknown>>;
  const combinator = (tree.op as string)?.toLowerCase() === "or" ? "or" : "and";
  const rules: unknown[] = [];

  for (const child of children) {
    if (child.type === "group") {
      rules.push(treeToJsonLogic(child));
    } else if (child.field) {
      const field = child.field as string;
      const op = child.op as string;
      const value = child.value as string;

      if (op === "is_true") {
        rules.push({ "==": [{ var: field }, true] });
      } else if (op === "is_false") {
        rules.push({ "==": [{ var: field }, false] });
      } else if (op === "in" || op === "not_in") {
        const vals = value.split(",").map((v) => v.trim());
        const inExpr = { in: [{ var: field }, vals] };
        rules.push(op === "not_in" ? { "!": [inExpr] } : inExpr);
      } else if (op === "contains") {
        rules.push({ in: [value, { var: field }] });
      } else if (op === "starts_with") {
        rules.push({
          regex: [
            { var: field },
            `^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          ],
        });
      } else if (op === "ends_with") {
        rules.push({
          regex: [
            { var: field },
            `${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          ],
        });
      } else if (op === "regex") {
        rules.push({ regex: [{ var: field }, value] });
      } else if (op === "between") {
        const [lo, hi] = value.split(",").map((v) => Number(v.trim()));
        rules.push({
          and: [{ ">=": [{ var: field }, lo] }, { "<=": [{ var: field }, hi] }],
        });
      } else if (op === ">") {
        rules.push({ ">": [{ var: field }, Number(value)] });
      } else if (op === "<") {
        rules.push({ "<": [{ var: field }, Number(value)] });
      } else if (op === ">=" || op === "≥") {
        rules.push({ ">=": [{ var: field }, Number(value)] });
      } else if (op === "<=" || op === "≤") {
        rules.push({ "<=": [{ var: field }, Number(value)] });
      } else if (op === "=" || op === "==") {
        rules.push({ "==": [{ var: field }, value] });
      } else if (op === "!=" || op === "≠") {
        rules.push({ "!=": [{ var: field }, value] });
      } else if (op === "after") {
        rules.push({ ">": [{ var: field }, value] });
      } else if (op === "before") {
        rules.push({ "<": [{ var: field }, value] });
      }
    }
  }

  if (rules.length === 1) return rules[0] as Record<string, unknown>;
  return { [combinator]: rules };
}

function fieldOf(node: unknown): string {
  if (
    node &&
    typeof node === "object" &&
    !Array.isArray(node) &&
    "var" in (node as Record<string, unknown>)
  ) {
    return String((node as Record<string, unknown>).var ?? "");
  }
  return "";
}

function escapeRegex(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unescapeRegex(pattern: string): string {
  return pattern.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
}

/** Reverse of the escaping in treeToJsonLogic's starts_with/ends_with branches. */
function literalAnchor(
  pattern: string,
): { op: "starts_with" | "ends_with"; value: string } | null {
  if (pattern.startsWith("^")) {
    const rest = pattern.slice(1);
    const literal = unescapeRegex(rest);
    if (escapeRegex(literal) === rest)
      return { op: "starts_with", value: literal };
  }
  if (pattern.endsWith("$")) {
    const rest = pattern.slice(0, -1);
    const literal = unescapeRegex(rest);
    if (escapeRegex(literal) === rest)
      return { op: "ends_with", value: literal };
  }
  return null;
}

function leafToCondition(
  op: string,
  args: unknown,
  createId: () => string,
): Condition | null {
  const cond = (field: string, condOp: string, value: string): Condition => ({
    id: createId(),
    type: "cond",
    field,
    op: condOp,
    value,
  });

  if (op === "==" && Array.isArray(args) && args.length === 2) {
    const field = fieldOf(args[0]);
    if (typeof args[1] === "boolean") {
      return cond(field, args[1] ? "is_true" : "is_false", "");
    }
    return cond(field, "=", String(args[1]));
  }

  if (op === "!=" && Array.isArray(args) && args.length === 2) {
    return cond(fieldOf(args[0]), "≠", String(args[1]));
  }

  if (
    (op === ">" || op === "<" || op === ">=" || op === "<=") &&
    Array.isArray(args) &&
    args.length === 2
  ) {
    const symbol = op === ">=" ? "≥" : op === "<=" ? "≤" : op;
    return cond(fieldOf(args[0]), symbol, String(args[1]));
  }

  if (op === "in" && Array.isArray(args) && args.length === 2) {
    const [a0, a1] = args;
    // contains is encoded as {in: [value, {var: field}]} (reversed operand order)
    if (typeof a0 !== "object" && fieldOf(a1)) {
      return cond(fieldOf(a1), "contains", String(a0));
    }
    const values = Array.isArray(a1) ? a1.map(String).join(",") : String(a1);
    return cond(fieldOf(a0), "in", values);
  }

  if (op === "regex" && Array.isArray(args) && args.length === 2) {
    const field = fieldOf(args[0]);
    const pattern = String(args[1]);
    const anchored = literalAnchor(pattern);
    if (anchored) return cond(field, anchored.op, anchored.value);
    return cond(field, "regex", pattern);
  }

  if (op === "!" && Array.isArray(args) && args.length === 1) {
    const inner = args[0];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const innerEntries = Object.entries(inner as Record<string, unknown>);
      if (innerEntries.length === 1) {
        const [innerOp, innerArgs] = innerEntries[0] as [string, unknown];
        if (
          innerOp === "in" &&
          Array.isArray(innerArgs) &&
          innerArgs.length === 2
        ) {
          const values = Array.isArray(innerArgs[1])
            ? innerArgs[1].map(String).join(",")
            : String(innerArgs[1]);
          return cond(fieldOf(innerArgs[0]), "not_in", values);
        }
        const innerCond = leafToCondition(innerOp, innerArgs, createId);
        if (innerCond) {
          const flipped =
            innerCond.op === "="
              ? "≠"
              : innerCond.op === "≠"
                ? "="
                : innerCond.op;
          return { ...innerCond, op: flipped };
        }
      }
    }
    return null;
  }

  return null;
}

/**
 * Collapses the {and: [{">=": ...}, {"<=": ...}]} shape treeToJsonLogic emits
 * for "between" back into a single "between" condition. This is a best-effort
 * heuristic: an AND of two genuinely separate >=/<= conditions on the same
 * field is indistinguishable from a "between" on the wire, and will also
 * collapse. That's harmless (same evaluation semantics either way).
 */
function collapseBetweenPairs(
  children: Condition[],
  createId: () => string,
): Condition[] {
  if (children.length !== 2) return children;
  const [a, b] = children;
  if (
    a.type !== "cond" ||
    b.type !== "cond" ||
    !a.field ||
    a.field !== b.field
  ) {
    return children;
  }
  const isGte = (c: Condition) => c.op === ">=" || c.op === "≥";
  const isLte = (c: Condition) => c.op === "<=" || c.op === "≤";
  const [lo, hi] =
    isGte(a) && isLte(b)
      ? [a, b]
      : isGte(b) && isLte(a)
        ? [b, a]
        : [null, null];
  if (!lo || !hi) return children;
  return [
    {
      id: createId(),
      type: "cond",
      field: a.field,
      op: "between",
      value: `${lo.value},${hi.value}`,
    },
  ];
}

function ruleToCondition(rule: unknown, createId: () => string): Condition {
  const fallback = (): Condition => ({
    id: createId(),
    type: "cond",
    field: "",
    op: "=",
    value: "",
  });

  if (!rule || typeof rule !== "object" || Array.isArray(rule))
    return fallback();

  const entries = Object.entries(rule as Record<string, unknown>);
  if (entries.length === 0) return fallback();

  const [op, args] = entries[0] as [string, unknown];
  if (op === "and" || op === "or") {
    return jsonLogicToConditionTree(rule as Record<string, unknown>, createId);
  }

  return leafToCondition(op, args, createId) ?? fallback();
}

export function jsonLogicToConditionTree(
  logic: Record<string, unknown>,
  createId: () => string = createConditionId,
): Condition {
  const root: Condition = {
    id: createId(),
    type: "group",
    op: "AND",
    children: [],
  };
  if (!logic || typeof logic !== "object") return root;

  const entries = Object.entries(logic);
  if (entries.length === 0) return root;

  const [op, args] = entries[0] as [string, unknown];

  if (op === "and" || op === "or") {
    root.op = op === "or" ? "OR" : "AND";
    root.children = Array.isArray(args)
      ? collapseBetweenPairs(
          args.map((arg) => ruleToCondition(arg, createId)),
          createId,
        )
      : [];
    return root;
  }

  root.children = [ruleToCondition(logic, createId)];
  return root;
}
