"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { ResultPanel } from "@/components/console/result-panel";
import { ConsoleHeader } from "@/components/console/console-header";
import { EventSourcePanel } from "@/components/console/event-source-panel";
import { JsonEditorPanel } from "@/components/console/json-editor-panel";
import { useEngineStatus } from "@/lib/hooks/useEngineStatus";
import { useConsoleSimulation } from "@/lib/hooks/useConsoleSimulation";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";

const CONSOLE_SIDEBAR = (
  <Sidebar
    currentRoute="console"
    navItems={NAV_ITEMS}
    adminItems={ADMIN_ITEMS}
    footer={<SidebarFooter />}
  />
);
const CONSOLE_BREADCRUMBS = [
  { label: "Red Velvet" },
  { label: "Decision console" },
];

export default function DecisionConsolePage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("json");
  const { engineReady, rulesLoadedCount } = useEngineStatus();
  const {
    jsonContent,
    jsonError,
    evaluating,
    decisionResult,
    traceSteps,
    recentSimulations,
    handleJsonChange,
    handleEvaluate,
    loadSimIntoConsole,
    loadSimulationIntoJson,
  } = useConsoleSimulation(rulesLoadedCount);

  const consoleTopbar = useMemo(
    () => (
      <Topbar
        breadcrumbs={CONSOLE_BREADCRUMBS}
        engineStatus={{ ready: engineReady, rulesCount: rulesLoadedCount }}
      />
    ),
    [engineReady, rulesLoadedCount],
  );

  return (
    <AppShell noPad sidebar={CONSOLE_SIDEBAR} topbar={consoleTopbar}>
      <div
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: "1fr 380px" }}
      >
        {/* Left column: Event editor */}
        <div className="flex flex-col overflow-hidden">
          <ConsoleHeader
            evaluating={evaluating}
            jsonError={jsonError}
            onLoadTemplate={loadSimIntoConsole}
            onEvaluate={handleEvaluate}
          />

          <div
            className="flex-1 overflow-hidden grid"
            style={{ gridTemplateColumns: "180px 1fr" }}
          >
            <EventSourcePanel
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              recentSimulations={recentSimulations}
              onSelectSimulation={loadSimulationIntoJson}
            />
            <JsonEditorPanel
              jsonContent={jsonContent}
              jsonError={jsonError}
              onChange={handleJsonChange}
            />
          </div>
        </div>

        {/* Right column: Simulation Results */}
        <ResultPanel
          decision={decisionResult}
          trace={traceSteps}
          onNavigate={(id) => router.push(`/rules/inspector?id=${id}`)}
        />
      </div>
    </AppShell>
  );
}
