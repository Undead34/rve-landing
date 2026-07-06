interface RuleInspectorTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
  historyCount: number;
  relatedCount: number;
}

export function RuleInspectorTabs({
  activeTab,
  onChange,
  historyCount,
  relatedCount,
}: RuleInspectorTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "conditions", label: "Conditions" },
    { id: "consequence", label: "Consequence" },
    { id: "history", label: "History", count: historyCount },
    { id: "related", label: "Related rules", count: relatedCount },
  ];

  return (
    <div className="border-b border-(--border) mb-6 flex gap-4">
      {tabs.map((tab) => (
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
          {tab.count !== undefined && (
            <span className="ml-1.5 text-[10px] font-mono bg-(--bg-inset) px-1.5 py-0.5 rounded-full text-(--fg-subtle)">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
