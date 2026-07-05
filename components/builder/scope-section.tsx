"use client";

import { useState } from "react";
import { Icon } from "../ui/icon";

const CHANNELS = ["web", "mobile", "api", "branch", "atm", "callcenter"];

const CHANNEL_HINTS: Record<string, string> = {
  web: "Browser, web app",
  mobile: "iOS & Android apps",
  api: "Public REST/gRPC API",
  branch: "In-branch teller events",
  atm: "ATM transactions",
  callcenter: "Agent-assisted events",
};

interface ScopeSectionProps {
  channels: string[];
  onChange: (channels: string[]) => void;
}

export function ScopeSection({ channels, onChange }: ScopeSectionProps) {
  const toggle = (c: string) => {
    if (channels.includes(c)) onChange(channels.filter((x) => x !== c));
    else onChange([...channels, c]);
  };

  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 720 }}>
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] m-0 mb-1">
          Scope
        </h2>
        <p className="text-[13px] text-(--fg-muted) m-0">
          Channels this rule will evaluate against. At least one channel is
          required.
        </p>
      </div>

      <div className="field">
        <label className="field-label">Channels</label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {CHANNELS.map((c) => {
            const on = channels.includes(c);
            return (
              <div
                key={c}
                onClick={() => toggle(c)}
                style={{
                  padding: 12,
                  border: `1px solid ${on ? "var(--fg)" : "var(--border)"}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  background: on ? "var(--bg-active)" : "var(--bg-elev)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {c}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--fg-subtle)",
                      textTransform: "capitalize",
                    }}
                  >
                    {CHANNEL_HINTS[c] || ""}
                  </div>
                </div>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `1px solid ${on ? "var(--fg)" : "var(--border-strong)"}`,
                    background: on ? "var(--fg)" : "transparent",
                    color: "var(--bg-elev)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {on && <Icon name="check" size={10} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Collapsible label="Exclusions">
        <div className="field">
          <label className="field-label">Exclude (optional)</label>
          <input
            className="input mono"
            placeholder="customer.risk_segment:low, customer.kyc_level:L3"
            style={{ width: "100%" }}
          />
          <div className="field-hint">
            Comma-separated. Customer IDs, risk segments, or KYC levels to skip.
          </div>
        </div>
      </Collapsible>
    </div>
  );
}

function Collapsible({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        border: "1px solid var(--border-faint)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "var(--fs-sm)",
          fontWeight: 500,
          color: "var(--fg-muted)",
          background: "var(--bg-subtle)",
        }}
      >
        <Icon name={open ? "chevron-down" : "chevron-right"} size={12} />
        {label}
      </div>
      {open && (
        <div
          style={{
            padding: 12,
            borderTop: "1px solid var(--border-faint)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
