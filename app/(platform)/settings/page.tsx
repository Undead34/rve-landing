"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { useEngineSettings } from "@/lib/hooks/useEngineSettings";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { RuntimeTab } from "@/components/settings/runtime-tab";
import { ContractTab } from "@/components/settings/contract-tab";
import { TeamTab } from "@/components/settings/team-tab";

const SETTINGS_SIDEBAR = (
  <Sidebar
    currentRoute="settings"
    navItems={NAV_ITEMS}
    adminItems={ADMIN_ITEMS}
    footer={<SidebarFooter />}
  />
);
const SETTINGS_BREADCRUMBS = [{ label: "Red Velvet" }, { label: "Settings" }];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("runtime");
  const { engineReady, rulesLoadedCount, engineInfo, contractInfo } =
    useEngineSettings();

  const settingsTopbar = useMemo(
    () => (
      <Topbar
        breadcrumbs={SETTINGS_BREADCRUMBS}
        engineStatus={{ ready: engineReady, rulesCount: rulesLoadedCount }}
      />
    ),
    [engineReady, rulesLoadedCount],
  );

  return (
    <AppShell sidebar={SETTINGS_SIDEBAR} topbar={settingsTopbar}>
      <div className="page-header mb-6">
        <h1 className="text-(--fs-xl) font-semibold tracking-[-0.02em] m-0">
          Settings
        </h1>
        <p className="text-(--fg-muted) mt-1 m-0">
          Runtime preferences and integration contract reference.
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "runtime" && <RuntimeTab engineInfo={engineInfo} />}
        {activeTab === "contract" && (
          <ContractTab contractInfo={contractInfo} />
        )}
        {activeTab === "team" && <TeamTab />}
      </div>
    </AppShell>
  );
}
