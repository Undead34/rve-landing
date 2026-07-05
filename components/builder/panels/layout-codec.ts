import type { IJsonModel } from "flexlayout-react";

/**
 * Serialization boundary for the builder's FlexLayout state. Everything here is
 * pure and DOM-free — no `localStorage`, no FlexLayout runtime (only its JSON
 * type). That keeps the safety-critical "can I trust this saved blob?" logic
 * unit-testable in isolation (see layout-codec.test.ts).
 */

/** Bump when the persisted layout shape changes incompatibly; older saves are then discarded. */
export const LAYOUT_SCHEMA_VERSION = 1;

/**
 * Minimal key/value surface. Inject the browser's `localStorage` in the app and
 * a fake in tests — nothing in the codec/store reaches for the global directly.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface LayoutEnvelope {
  version: number;
  model: IJsonModel;
}

export interface LayoutCodecOptions {
  /** Every tab id the current registry can render; saves referencing others are rejected. */
  knownPanelIds: ReadonlySet<string>;
  /** Schema version the app currently reads/writes. Defaults to LAYOUT_SCHEMA_VERSION. */
  version?: number;
}

/** Collects every tab `id` in a raw FlexLayout JSON tree (children, borders, and the nested `layout`). */
export function collectTabIds(
  node: unknown,
  ids: Set<string> = new Set(),
): Set<string> {
  if (!node || typeof node !== "object") return ids;
  const record = node as Record<string, unknown>;
  if (record.type === "tab" && typeof record.id === "string")
    ids.add(record.id);
  // The root model nests the row tree under `layout` (an object, not an array).
  if (record.layout && typeof record.layout === "object") {
    collectTabIds(record.layout, ids);
  }
  for (const key of ["children", "borders"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      for (const child of value) collectTabIds(child, ids);
    }
  }
  return ids;
}

function isEnvelope(value: unknown): value is LayoutEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "number" &&
    typeof v.model === "object" &&
    v.model !== null
  );
}

/** Wraps a model in a versioned envelope and stringifies it. Pure. */
export function serializeLayout(
  model: IJsonModel,
  version: number = LAYOUT_SCHEMA_VERSION,
): string {
  const envelope: LayoutEnvelope = { version, model };
  return JSON.stringify(envelope);
}

/**
 * Turns a stored string back into model JSON, or `null` when it is missing,
 * malformed, from an incompatible schema version, or references tab ids the
 * current registry cannot render (which would render as blank panels). Pure —
 * this is the trust boundary for anything coming out of storage.
 */
export function parseLayout(
  raw: string | null,
  opts: LayoutCodecOptions,
): IJsonModel | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isEnvelope(parsed)) return null;

  const expected = opts.version ?? LAYOUT_SCHEMA_VERSION;
  if (parsed.version !== expected) return null;

  const ids = collectTabIds(parsed.model);
  if (ids.size === 0) return null;
  for (const id of ids) {
    if (!opts.knownPanelIds.has(id)) return null;
  }

  return parsed.model;
}
