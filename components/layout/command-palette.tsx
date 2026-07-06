"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCommandPaletteStore } from "@/lib/stores/command-palette-store";
import { useRuleStore } from "@/lib/stores/rule-store";
import { useRuleCrud } from "@/lib/hooks/useRuleCrud";
import { HttpRuleRepository } from "@/lib/infrastructure/http-repository";
import type { FraudRule } from "@/lib/domain/types";
import { Icon } from "@/components/ui/icon";
import { Kbd } from "@/components/ui/kbd";

const repository = new HttpRuleRepository();

export function CommandPalette() {
  const isOpen = useCommandPaletteStore((s) => s.isOpen);
  const setIsOpen = useCommandPaletteStore((s) => s.setIsOpen);
  const toggle = useCommandPaletteStore((s) => s.toggle);

  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [rules, setRules] = useState<FraudRule[]>([]);
  const [loading, setLoading] = useState(false);

  const setPolicy = useRuleStore((s) => s.setPolicy);
  const resetDraft = useRuleStore((s) => s.resetDraft);
  const { saveRule } = useRuleCrud();

  // Toggle shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  // Load rules when command palette opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      repository
        .getAll(1, 100)
        .then((res) => {
          setRules(res.data || []);
        })
        .catch((err) => {
          console.error("Failed to load rules for palette:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleToggleTheme = () => {
    setIsOpen(false);
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleReloadEngine = async () => {
    setIsOpen(false);
    try {
      await repository.reloadEngine();
      alert("Engine reloaded successfully!");
    } catch (err) {
      alert("Failed to reload engine: " + err);
    }
  };

  const handleCreateNewRule = () => {
    setIsOpen(false);
    resetDraft();
    router.push("/rules/builder");
  };

  const handleSaveRule = () => {
    setIsOpen(false);
    void saveRule();
  };

  const handleSetPolicyMode = (
    mode: "active" | "staged" | "suspended" | "deactivated",
  ) => {
    setIsOpen(false);
    setPolicy({ mode });
  };

  const isBuilderPage = pathname === "/rules/builder";

  return (
    <>
      <div className="cmdk-overlay" onClick={() => setIsOpen(false)} />
      <div className="cmdk-dialog">
        <Command label="Global Command Menu">
          <div className="cmdk-input-container">
            <Icon name="search" size={16} className="text-(--fg-subtle)" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search rules..."
              className="cmdk-input"
            />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn sm ghost font-mono text-[10px] px-1.5 py-0.5 cursor-pointer"
            >
              ESC
            </button>
          </div>

          <Command.List className="cmdk-list">
            <Command.Empty className="cmdk-empty">
              No results found.
            </Command.Empty>

            {/* Context-Specific Actions (Rule Builder) */}
            {isBuilderPage && (
              <Command.Group
                heading="Rule Builder Options"
                className="cmdk-group"
              >
                <Command.Item onSelect={handleSaveRule} className="cmdk-item">
                  <Icon name="check" size={14} className="cmdk-item-icon" />
                  <span>Save changes</span>
                  <div className="cmdk-item-shortcut">
                    <Kbd>⌘S</Kbd>
                  </div>
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSetPolicyMode("active")}
                  className="cmdk-item"
                >
                  <Icon name="shield" size={14} className="cmdk-item-icon" />
                  <span>Set Execution Mode: Active</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSetPolicyMode("staged")}
                  className="cmdk-item"
                >
                  <Icon name="shield" size={14} className="cmdk-item-icon" />
                  <span>Set Execution Mode: Staged</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSetPolicyMode("suspended")}
                  className="cmdk-item"
                >
                  <Icon name="shield" size={14} className="cmdk-item-icon" />
                  <span>Set Execution Mode: Suspended</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSetPolicyMode("deactivated")}
                  className="cmdk-item"
                >
                  <Icon name="shield" size={14} className="cmdk-item-icon" />
                  <span>Set Execution Mode: Deactivated</span>
                </Command.Item>
              </Command.Group>
            )}

            {/* Navigation Group */}
            <Command.Group heading="Navigation" className="cmdk-group">
              <Command.Item
                onSelect={() => navigate("/dashboard")}
                className="cmdk-item"
              >
                <Icon name="dashboard" size={14} className="cmdk-item-icon" />
                <span>Go to Dashboard</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>G</Kbd> <Kbd>D</Kbd>
                </div>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/rules")}
                className="cmdk-item"
              >
                <Icon name="library" size={14} className="cmdk-item-icon" />
                <span>Go to Rule Library</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>G</Kbd> <Kbd>L</Kbd>
                </div>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/rules/builder")}
                className="cmdk-item"
              >
                <Icon name="builder" size={14} className="cmdk-item-icon" />
                <span>Go to Rule Builder</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>G</Kbd> <Kbd>B</Kbd>
                </div>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/console")}
                className="cmdk-item"
              >
                <Icon name="simulator" size={14} className="cmdk-item-icon" />
                <span>Go to Decision Console</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>G</Kbd> <Kbd>C</Kbd>
                </div>
              </Command.Item>
              <Command.Item
                onSelect={() => navigate("/settings")}
                className="cmdk-item"
              >
                <Icon name="settings" size={14} className="cmdk-item-icon" />
                <span>Go to Settings</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>G</Kbd> <Kbd>S</Kbd>
                </div>
              </Command.Item>
            </Command.Group>

            {/* Actions Group */}
            <Command.Group heading="Actions" className="cmdk-group">
              <Command.Item
                onSelect={handleCreateNewRule}
                className="cmdk-item"
              >
                <Icon name="plus" size={14} className="cmdk-item-icon" />
                <span>Create New Rule</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>C</Kbd> <Kbd>R</Kbd>
                </div>
              </Command.Item>
              <Command.Item onSelect={handleReloadEngine} className="cmdk-item">
                <Icon name="refresh" size={14} className="cmdk-item-icon" />
                <span>Reload Decision Engine</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>⇧</Kbd> <Kbd>R</Kbd>
                </div>
              </Command.Item>
              <Command.Item onSelect={handleToggleTheme} className="cmdk-item">
                <Icon name="eye" size={14} className="cmdk-item-icon" />
                <span>Toggle Theme Mode</span>
                <div className="cmdk-item-shortcut">
                  <Kbd>T</Kbd> <Kbd>T</Kbd>
                </div>
              </Command.Item>
            </Command.Group>

            {/* Rules Search Group */}
            {rules.length > 0 && (
              <Command.Group heading="Rules" className="cmdk-group">
                {rules.map((rule) => (
                  <Command.Item
                    key={rule.id}
                    value={`${rule.meta?.name || ""} ${rule.meta?.code || ""} ${rule.id}`.toLowerCase()}
                    onSelect={() => navigate(`/rules/inspector?id=${rule.id}`)}
                    className="cmdk-item"
                  >
                    <Icon name="rule" size={14} className="cmdk-item-icon" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">
                        {rule.meta?.name}
                      </span>
                      <span className="text-[10px] text-(--fg-subtle) font-mono">
                        {rule.meta?.code || "N/A"} ·{" "}
                        {rule.state.mode.toUpperCase()}
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {loading && (
              <div className="text-center py-4 text-[12px] text-(--fg-muted)">
                Loading rules from engine...
              </div>
            )}
          </Command.List>
        </Command>
      </div>
    </>
  );
}
