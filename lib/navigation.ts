import type { IconName } from "@/components/ui/icon";

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "library", label: "Rule library", icon: "library", badge: "10" },
  { id: "builder", label: "Rule builder", icon: "builder" },
  { id: "console", label: "Decision console", icon: "simulator" },
  { id: "inspector", label: "Rule inspector", icon: "inspector" },
];

export const ADMIN_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings", icon: "settings" },
];
