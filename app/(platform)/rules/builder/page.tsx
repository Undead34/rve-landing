import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { Topbar } from "@/components/layout/topbar";
import { RuleBuilderHeader } from "@/components/rule-builder/organisms/rule-builder-header";
import { RuleBuilderWorkspace } from "@/components/rule-builder/organisms/rule-builder-workspace";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/lib/navigation";

const BUILDER_SIDEBAR = (
  <Sidebar
    currentRoute="builder"
    navItems={NAV_ITEMS}
    adminItems={ADMIN_ITEMS}
    footer={<SidebarFooter />}
  />
);

const BUILDER_TOPBAR = (
  <Topbar breadcrumbs={[{ label: "Red Velvet" }, { label: "Rule builder" }]} />
);

export default function BuilderPage() {
  return (
    <AppShell noPad sidebar={BUILDER_SIDEBAR} topbar={BUILDER_TOPBAR}>
      <div className="flex min-h-0 flex-1 flex-col">
        <RuleBuilderHeader />
        <Suspense fallback={<div className="min-h-0 flex-1" />}>
          <RuleBuilderWorkspace />
        </Suspense>
      </div>
    </AppShell>
  );
}
