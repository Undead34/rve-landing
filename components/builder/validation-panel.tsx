"use client";

import { Icon } from "../ui/icon";
import type { EnforcementAction, RuleMode } from "@/lib/domain/types";

interface ValidationMessage {
  section: string;
  level: "error" | "warn";
  msg: string;
}

interface ValidationPanelProps {
  validation: ValidationMessage[];
  onJump: (section: string) => void;
  errorCount: number;
  warnCount: number;
  mode: RuleMode;
  rollout: number;
  action: EnforcementAction;
  scoreImpact: number;
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
}: ValidationPanelProps) {
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
        <div
          style={{ fontSize: 11, color: "var(--fg-muted)" }}
        >
          {errorCount} {errorCount === 1 ? "error" : "errors"} · {warnCount}{" "}
          {warnCount === 1 ? "warning" : "warnings"}
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
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              All checks pass
            </div>
            <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>
              Rule is ready to save.
            </div>
          </div>
        )}
        {validation.map((v, i) => (
          <div
            key={i}
            onClick={() => onJump(v.section)}
            style={{
              padding: "10px 12px",
              marginBottom: 6,
              cursor: "pointer",
              borderRadius: 6,
              border: "1px solid",
              borderColor:
                v.level === "error"
                  ? "var(--accent-border)"
                  : "var(--status-staged-border)",
              background:
                v.level === "error"
                  ? "var(--accent-soft)"
                  : "var(--status-staged-bg)",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span
                style={{
                  color:
                    v.level === "error"
                      ? "var(--accent)"
                      : "var(--status-staged)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Icon name="alert" size={12} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--fg)",
                    lineHeight: 1.35,
                  }}
                >
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
                  {v.section}
                </div>
              </div>
            </div>
          </div>
        ))}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--fg-muted)" }}>When matched</span>
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
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--fg-muted)" }}>Score delta</span>
            <span className="font-mono">+{scoreImpact}.0</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--fg-muted)" }}>Mode</span>
            <span
              className={`badge ${mode} mono`}
              style={{ fontSize: 10, padding: "1px 7px" }}
            >
              <span className="dot" />
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--fg-muted)" }}>Traffic evaluated</span>
            <span className="font-mono">{rollout}%</span>
          </div>
        </div>
      </div>
    </>
  );
}
