import { Button } from "@/components/ui/button";
import type { FraudRule } from "@/lib/domain/types";

function renderLogicOperator(operator: string) {
  const label =
    operator === "==" || operator === "==="
      ? "="
      : operator === "!=" || operator === "!=="
        ? "≠"
        : operator;

  return <span className="text-amber-500 font-semibold px-1">{label}</span>;
}

function renderLogicOperand(value: unknown) {
  if (typeof value === "object" && value !== null && "var" in value) {
    return (
      <span className="text-emerald-400 font-mono font-medium">
        {String((value as Record<string, unknown>).var)}
      </span>
    );
  }

  if (typeof value === "string") {
    return <span className="text-rose-400 font-mono">{`"${value}"`}</span>;
  }

  return <span className="text-sky-400 font-mono">{String(value)}</span>;
}

function getStableListEntries<T>(
  items: T[],
  getSignature: (item: T) => string,
): Array<{ item: T; key: string }> {
  const seen = new Map<string, number>();

  return items.map((item) => {
    const signature = getSignature(item);
    const occurrence = seen.get(signature) ?? 0;
    seen.set(signature, occurrence + 1);

    return {
      item,
      key: `${signature}:${occurrence}`,
    };
  });
}

// Renders the JsonLogic tree recursively.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LogicVisualizer({ logic }: { logic: any }) {
  if (!logic || typeof logic !== "object") {
    return <span className="text-(--fg)">{String(logic)}</span>;
  }

  const entries = Object.entries(logic);
  if (entries.length === 0) return <span>{"{}"}</span>;

  const [op, args] = entries[0];

  if (op === "and" || op === "or") {
    const isAnd = op === "and";
    const logicArgs = getStableListEntries(
      args as unknown[],
      (arg) => JSON.stringify(arg) ?? String(arg),
    );

    return (
      <div className="flex flex-col gap-2 pl-4 border-l border-(--border-strong) my-1">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
              isAnd
                ? "bg-blue-900/40 text-blue-300"
                : "bg-purple-900/40 text-purple-300"
            }`}
          >
            {op}
          </span>
          <span className="text-(--fg-subtle) text-[11px] font-mono">
            ({(args as unknown[]).length} conditions)
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {logicArgs.map(({ item, key }) => (
            <div key={key}>
              <LogicVisualizer logic={item} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (Array.isArray(args) && args.length >= 2) {
    const left = args[0];
    const right = args[1];

    return (
      <div className="flex items-center flex-wrap gap-1 bg-(--bg-elev) px-3 py-1.5 rounded border border-(--border-faint) w-fit">
        {renderLogicOperand(left)}
        {renderLogicOperator(op)}
        {renderLogicOperand(right)}
      </div>
    );
  }

  // Fallback for custom jsonlogic or negation
  return (
    <div className="text-(--fg-muted) pl-2">
      <span className="text-purple-400 font-semibold">{op}: </span>
      <span className="font-mono text-[12px]">{JSON.stringify(args)}</span>
    </div>
  );
}

export function ConditionsTab({ rule }: { rule: FraudRule }) {
  return (
    <div className="bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[16px] font-semibold m-0">Evaluation logic</h2>
          <p className="text-(--fg-muted) text-[12px] m-0">
            JSONLogic representation compiled by the rule engine.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            navigator.clipboard.writeText(
              JSON.stringify(rule.evaluation.logic, null, 2),
            )
          }
        >
          Copy JSON logic
        </Button>
      </div>
      <div className="bg-(--bg-inset) rounded-lg p-5 font-mono text-[13px] overflow-x-auto border border-(--border)">
        <LogicVisualizer logic={rule.evaluation.logic} />
      </div>
    </div>
  );
}
