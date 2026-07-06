import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { ToggleSetting } from "./toggle-setting";

interface EngineInfo {
  version: string;
  mode: string;
  message: string;
  loadedRules: number;
  repositoryRules: number;
}

export function RuntimeTab({ engineInfo }: { engineInfo: EngineInfo }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engine settings</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <ToggleSetting
              label="Auto-reload on rule change"
              hint="Engine picks up rule changes within 30 seconds."
              defaultChecked
            />
            <ToggleSetting
              label="Strict validation on save"
              hint="Reject rules that don't pass full semantic validation."
              defaultChecked
            />
            <ToggleSetting
              label="Shadow-eval all staged rules"
              hint="Evaluate staged rules against live traffic, but never enforce them."
              defaultChecked
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring rules</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-(--fg) flex items-center gap-1.5">
                Score Aggregation
              </label>
              <span className="text-[11px] text-(--fg-subtle)">
                How hits combine into a final score.
              </span>
              <select className="px-[10px] py-[6px] text-[13px] rounded-(--radius-md) border border-(--border-strong) bg-(--bg-elev) outline-none cursor-pointer w-full md:w-80">
                <option value="sum_capped">Sum (capped at 10)</option>
                <option value="max">Maximum hit</option>
                <option value="weighted">Weighted average</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-(--fg)">
                  Review Threshold
                </label>
                <span className="text-[11px] text-(--fg-subtle)">
                  Score ≥ this routes to manual review.
                </span>
                <input
                  type="number"
                  defaultValue="3"
                  className="px-[10px] py-[5px] text-[13px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-(--fg)">
                  Block Threshold
                </label>
                <span className="text-[11px] text-(--fg-subtle)">
                  Score ≥ this blocks the event transaction.
                </span>
                <input
                  type="number"
                  defaultValue="7"
                  className="px-[10px] py-[5px] text-[13px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none w-full"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications & hooks</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-5">
            <ToggleSetting label="Alert on rule deactivation" defaultChecked />
            <ToggleSetting
              label="Alert on engine reload failure"
              defaultChecked
            />
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[13px] font-semibold text-(--fg)">
                Webhook Endpoint URL
              </label>
              <input
                type="text"
                placeholder="https://hooks.example.com/rve-updates"
                className="px-[10px] py-[5px] text-[13px] font-mono rounded border border-(--border-strong) bg-(--bg-elev) outline-none w-full"
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engine information</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">
                Engine version
              </div>
              <div className="font-mono text-[14px] font-medium">
                {engineInfo.version}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">
                Repository Rules
              </div>
              <div className="font-mono text-[14px]">
                {engineInfo.repositoryRules} total rules
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">
                Loaded Rules
              </div>
              <div className="font-mono text-[14px]">
                {engineInfo.loadedRules} active/staged rules
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">
                Backend Mode
              </div>
              <div className="font-mono text-[13px] text-emerald-400 capitalize">
                {engineInfo.mode}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] text-(--fg-subtle) uppercase tracking-[0.04em]">
                Uptime
              </div>
              <div className="font-mono text-[13px]">
                Running (localhost:3439)
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
