export function treeToJsonLogic(
  tree: Record<string, unknown>
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
          and: [
            { ">=": [{ var: field }, lo] },
            { "<=": [{ var: field }, hi] },
          ],
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
      } else if (op === "after" || op === ">") {
        rules.push({ ">": [{ var: field }, value] });
      } else if (op === "before" || op === "<") {
        rules.push({ "<": [{ var: field }, value] });
      }
    }
  }

  if (rules.length === 1) return rules[0] as Record<string, unknown>;
  return { [combinator]: rules };
}
