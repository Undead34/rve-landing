"use client";

import { Icon } from "../ui/icon";
import type { EnforcementAction, RuleMode } from "@/lib/domain/types";
import type { ValidationMessage } from "@/lib/hooks/useRuleValidation";
import { SECTION_META } from "./panels/sections";

interface ValidationPanelProps {
  validation: ValidationMessage[];
  onJump: (section: string) => void;
  errorCount: number;
  warnCount: number;
  mode: RuleMode;
  rollout: number;
  action: EnforcementAction;
  scoreImpact: number;
  /** The section currently being edited — its issues are pinned to the top. */
  activeSection: string;
}

const SECTION_TITLE = new Map(SECTION_META.map((s) => [s.id, s.title]));

function sectionLabel(id: string): string {
  return SECTION_TITLE.get(id) ?? id;
}

export function ValidationPanel({
  validation,
  onJump,
  errorCount,
  warnCount,
  mode,
  rollout,
  action,
  scoreImpact,
  activeSection,
}: ValidationPanelProps) {
  // Context-aware split: issues for the section you're editing float to the
  // top under a "This section" heading; everything else sits below.
  const here = validation.filter((v) => v.section === activeSection);
  const others = validation.filter((v) => v.section !== activeSection);
  const activeTitle = sectionLabel(activeSection);

  return (
    <>
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
            Live validation
          </h3>
          {errorCount === 0 && warnCount === 0 && (
            <span
              className="badge active"
              style={{ padding: "1px 7px", fontSize: 11 }}
            >
              <span className="dot" />
              Valid
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
          {errorCount} {errorCount === 1 ? "error" : "errors"} · {warnCount}{" "}
          {warnCount === 1 ? "warning" : "warnings"} · viewing{" "}
          <span style={{ color: "var(--fg)", fontWeight: 500 }}>{activeTitle}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {validation.length === 0 && (
          <div style={{ padding: 16, textAlign: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--status-active-bg)",
                border: "1px solid var(--status-active-border)",
                color: "var(--status-active)",
                display: "inline-grid",
                placeItems: "center",
                marginBottom: 8,
              }}
            >
              <Icon name="check" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>All checks pass</div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>
              Rule is ready to save.
            </div>
          </div>
        )}

        {validation.length > 0 && (
          <>
            <ValidationGroupHeading>This section · {activeTitle}</ValidationGroupHeading>
            {here.length === 0 ? (
              <div
                style={{
                  padding: "8px 12px",
                  marginBottom: 8,
                  fontSize: 11,
                  color: "var(--fg-muted)",
                  border: "1px dashed var(--border-strong)",
                  borderRadius: 6,
                  background: "var(--bg-inset)",
                }}
              >
                No issues in this section.
              </div>
            ) : (
              here.map((v) => (
                <ValidationItem
                  key={`${v.level}:${v.section}:${v.msg}`}
                  message={v}
                  onJump={onJump}
                  emphasized
                />
              ))
            )}

            {others.length > 0 && (
              <>
                <ValidationGroupHeading>Other sections</ValidationGroupHeading>
                {others.map((v) => (
                  <ValidationItem
                    key={`${v.level}:${v.section}:${v.msg}`}
                    message={v}
                    onJump={onJump}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <div
        style={{
          padding: 16,
          borderTop: "1px solid var(--border-faint)",
          background: "var(--bg-inset)",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--fg-muted)",
          }}
        >
          Effective behavior
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <EffectiveRow label="When matched">
            <span
              className={`badge ${action} mono`}
              style={{ fontSize: 10, padding: "1px 7px" }}
            >
              <span className="dot" />
              {action === "allow"
                ? "Allow"
                : action === "review"
                  ? "Review"
                  : action === "block"
                    ? "Block"
                    : "Tag only"}
            </span>
          </EffectiveRow>
          <EffectiveRow label="Score delta">
            <span className="font-mono">+{scoreImpact}.0</span>
          </EffectiveRow>
          <EffectiveRow label="Mode">
            <span
              className={`badge ${mode} mono`}
              style={{ fontSize: 10, padding: "1px 7px" }}
            >
              <span className="dot" />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>
          </EffectiveRow>
          <EffectiveRow label="Traffic evaluated">
            <span className="font-mono">{rollout}%</span>
          </EffectiveRow>
        </div>
      </div>
    </>
  );
}

function ValidationGroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--fg-subtle)",
        padding: "6px 4px 4px",
      }}
    >
      {children}
    </div>
  );
}

function ValidationItem({
  message: v,
  onJump,
  emphasized,
}: {
  message: ValidationMessage;
  onJump: (section: string) => void;
  emphasized?: boolean;
}) {
  const isError = v.level === "error";
  return (
    <button
      type="button"
      onClick={() => onJump(v.section)}
      style={{
        width: "100%",
        font: "inherit",
        textAlign: "left",
        display: "block",
        padding: "10px 12px",
        marginBottom: 6,
        cursor: "pointer",
        borderRadius: 6,
        border: "1px solid",
        borderColor: isError
          ? "var(--accent-border)"
          : "var(--status-staged-border)",
        background: isError ? "var(--accent-soft)" : "var(--status-staged-bg)",
        borderLeftWidth: emphasized ? 3 : 1,
        borderLeftColor: emphasized
          ? isError
            ? "var(--accent)"
            : "var(--status-staged)"
          : undefined,
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span
          style={{
            color: isError ? "var(--accent)" : "var(--status-staged)",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          <Icon name="alert" size={12} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "var(--fg)", lineHeight: 1.35 }}>
            {v.msg}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--fg-muted)",
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {sectionLabel(v.section)}
          </div>
        </div>
      </div>
    </button>
  );
}

function EffectiveRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
      }}
    >
      <span style={{ color: "var(--fg-muted)" }}>{label}</span>
      {children}
    </div>
  );
}
