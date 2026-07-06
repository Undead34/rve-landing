import { Button } from "@/components/ui/button";

interface ConsoleHeaderProps {
  evaluating: boolean;
  jsonError: string | null;
  onLoadTemplate: (simType: string) => void;
  onEvaluate: () => void;
}

export function ConsoleHeader({
  evaluating,
  jsonError,
  onLoadTemplate,
  onEvaluate,
}: ConsoleHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-[14px] border-b border-(--border) bg-(--bg-elev) shrink-0">
      <div>
        <h1 className="text-lg font-semibold tracking-[-0.01em] m-0">
          Decision Console
        </h1>
        <p className="text-[12px] text-(--fg-muted) m-0 mt-[2px]">
          Simulate events against the current rule set. Engine version{" "}
          <span className="font-mono">v3.4.1</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button icon="upload" onClick={() => onLoadTemplate("card_velocity")}>
          Template: High Velocity Card
        </Button>
        <Button icon="copy" onClick={() => onLoadTemplate("normal")}>
          Template: Low Value
        </Button>
        <Button
          kind="accent"
          icon="play"
          onClick={onEvaluate}
          disabled={evaluating || !!jsonError}
        >
          {evaluating ? "Evaluating..." : "Evaluate"}
        </Button>
      </div>
    </div>
  );
}
