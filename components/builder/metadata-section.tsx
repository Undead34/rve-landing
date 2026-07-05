"use client";

import { useState } from "react";
import { Field } from "../ui/field";
import { Input, Textarea } from "../ui/input";
import { Icon } from "../ui/icon";

interface RuleMeta {
  code: string;
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
}

interface MetadataSectionProps {
  meta: RuleMeta;
  onChange: (meta: RuleMeta) => void;
}

export function MetadataSection({ meta, onChange }: MetadataSectionProps) {
  return (
    <div className="flex flex-col gap-5" style={{ maxWidth: 720 }}>
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] m-0 mb-1">
          Metadata
        </h2>
        <p className="text-[13px] text-(--fg-muted) m-0">
          Identifies and describes the rule. The code is permanent once saved.
        </p>
      </div>

      <Field
        label={
          <span>
            Rule code
            <HelpTip text="Unique identifier used in logs and API calls. Must be snake_case and cannot be changed after publishing." />
          </span>
        }
        required
        hint="Snake-case, unique. Cannot be changed after publish."
      >
        <Input
          className="font-mono"
          value={meta.code}
          onChange={(e) => onChange({ ...meta, code: e.target.value })}
        />
      </Field>

      <Field label="Display name" required>
        <Input
          value={meta.name}
          onChange={(e) => onChange({ ...meta, name: e.target.value })}
        />
      </Field>

      <Field label="Description" hint="Markdown supported.">
        <Textarea
          value={meta.description}
          onChange={(e) => onChange({ ...meta, description: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label={
            <span>
              Version
              <HelpTip text="Semantic version. Bump major when logic changes, minor for additions, patch for fixes." />
            </span>
          }
          required
          hint="Semver. Bump major when behaviour changes."
        >
          <Input
            className="font-mono"
            value={meta.version}
            onChange={(e) => onChange({ ...meta, version: e.target.value })}
          />
        </Field>
        <Field
          label={
            <span>
              Author
              <HelpTip text="Automatically set from SSO. The person who created this rule version." />
            </span>
          }
          hint="From SSO. Set automatically."
        >
          <Input className="font-mono" value={meta.author} disabled />
        </Field>
      </div>

      <Field
        label={
          <span>
            Tags
            <HelpTip text="Labels for filtering and grouping rules in the library. Not used in evaluation logic." />
          </span>
        }
        hint="Free-form labels. Used for filtering and grouping."
      >
        <TagInput
          tags={meta.tags}
          onChange={(tags) => onChange({ ...meta, tags })}
        />
      </Field>
    </div>
  );
}

function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: 6,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-elev)",
        minHeight: 32,
      }}
    >
      {tags.map((t) => (
        <span
          key={t}
          className="badge neutral mono"
          style={{ paddingRight: 4, fontSize: 11 }}
        >
          {t}
          <button
            type="button"
            className="icon-btn"
            style={{
              width: 14,
              height: 14,
              display: "inline-grid",
              placeItems: "center",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--fg-muted)",
              padding: 0,
            }}
            onClick={() => onChange(tags.filter((x) => x !== t))}
          >
            <Icon name="x" size={10} />
          </button>
        </span>
      ))}
      <input
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          flex: 1,
          minWidth: 80,
        }}
        placeholder={tags.length === 0 ? "Add tag and press Enter" : ""}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            onChange([...tags, draft.trim()]);
            setDraft("");
          }
          if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
      />
    </div>
  );
}

function HelpTip({ text }: { text: string }) {
  return (
    <span
      className="help-tip"
      style={{
        marginLeft: 4,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "var(--bg-subtle)",
        color: "var(--fg-subtle)",
        cursor: "help",
        fontSize: 9,
        fontWeight: 600,
        lineHeight: 1,
        verticalAlign: "middle",
      }}
      title=""
    >
      ?
      <span
        className="help-tip-content"
        style={{
          display: "none",
          position: "absolute",
          bottom: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          padding: "7px 10px",
          background: "var(--fg)",
          color: "var(--bg-elev)",
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 1.4,
          borderRadius: 6,
          boxShadow: "var(--shadow-md)",
          zIndex: 100,
          pointerEvents: "none",
          textAlign: "left",
          whiteSpace: "normal",
        }}
      >
        {text}
      </span>
    </span>
  );
}
