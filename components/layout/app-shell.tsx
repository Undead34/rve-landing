"use client";

import type { ReactNode } from "react";

interface AppShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}

export function AppShell({ sidebar, topbar, children, noPad }: AppShellProps) {
  return (
    <div
      className="grid h-screen overflow-hidden"
      style={{ gridTemplateColumns: "var(--sidebar-w) 1fr" }}
    >
      {sidebar}
      <div className="flex flex-col overflow-hidden bg-(--bg)">
        {topbar}
        <main className={`flex-1 ${noPad ? "overflow-hidden p-0 flex flex-col" : "overflow-auto p-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
