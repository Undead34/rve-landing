import { Icon } from "../ui/icon";
import { Input } from "../ui/input";
import { Kbd } from "../ui/kbd";
import { Segmented } from "../ui/tabs";

interface RuleFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  modeFilter: string;
  onModeFilterChange: (value: string) => void;
  channelFilter: string;
  onChannelFilterChange: (value: string) => void;
  channels: string[];
  total: number;
  filtered: number;
  view: "table" | "cards";
  onViewChange: (value: "table" | "cards") => void;
}

export function RuleFilters({
  search,
  onSearchChange,
  modeFilter,
  onModeFilterChange,
  channelFilter,
  onChannelFilterChange,
  channels,
  total,
  filtered,
  view,
  onViewChange,
}: RuleFiltersProps) {
  return (
    <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden mb-4">
      <div className="p-3 flex items-center gap-2 flex-wrap">
        <div
          className="relative flex-1 min-w-[240px]"
          style={{ flex: "1 1 320px" }}
        >
          <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--fg-subtle)]">
            <Icon name="search" size={12} />
          </span>
          <Input
            placeholder="Search rules by name, code, or tag..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="!pl-8"
          />
          <span className="absolute right-[10px] top-1/2 -translate-y-1/2">
            <Kbd>/</Kbd>
          </span>
        </div>

        <select
          className="px-[10px] py-[6px] text-[var(--fs-md)] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-elev)] outline-none cursor-pointer"
          value={modeFilter}
          onChange={(e) => onModeFilterChange(e.target.value)}
        >
          <option value="all">All modes</option>
          <option value="active">Active</option>
          <option value="staged">Staged</option>
          <option value="suspended">Suspended</option>
          <option value="deactivated">Deactivated</option>
        </select>

        <select
          className="px-[10px] py-[6px] text-[var(--fs-md)] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-elev)] outline-none cursor-pointer"
          value={channelFilter}
          onChange={(e) => onChannelFilterChange(e.target.value)}
        >
          <option value="all">All channels</option>
          {channels.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-[var(--fg-muted)]">
            {filtered} of {total}
          </span>
          <Segmented
            value={view}
            onChange={(v) => onViewChange(v as "table" | "cards")}
            options={[
              { value: "table", label: "Table" },
              { value: "cards", label: "Cards" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
