const SETTINGS_TABS = [
  { id: "runtime", label: "Runtime" },
  { id: "contract", label: "Integration contract" },
  { id: "team", label: "Team & access" },
];

export function SettingsTabs({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="border-b border-(--border) mb-6 flex gap-4">
      {SETTINGS_TABS.map((tab) => (
        <button
          type="button"
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 text-[14px] font-medium border-b-2 transition-all cursor-pointer relative ${
            activeTab === tab.id
              ? "border-(--accent) text-(--fg) font-semibold"
              : "border-transparent text-(--fg-muted) hover:text-(--fg)"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
