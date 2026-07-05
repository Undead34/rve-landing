import { Model } from "flexlayout-react";
import type { IJsonModel } from "flexlayout-react";
import {
  parseLayout,
  serializeLayout,
  type KeyValueStorage,
  type LayoutCodecOptions,
} from "./layout-codec";

/**
 * The stateful half of layout persistence: a small controller over a
 * `KeyValueStorage` that loads/saves the FlexLayout model. Restoration is
 * validated (via the codec), writes are debounced so dragging/resizing doesn't
 * hammer storage, and the storage backend is injected so the whole thing is
 * testable and SSR-safe.
 */

const DEFAULT_KEY = "rve-platform:builder-layout";
const DEFAULT_DEBOUNCE_MS = 400;

export interface LayoutStore {
  /** Loads the saved layout, or builds the default when there is none / it's rejected. */
  load(buildDefault: () => IJsonModel): Model;
  /** Persists a model, debounced to coalesce rapid drag/resize changes. */
  save(model: Model): void;
  /** Writes any pending save immediately — call on unmount so the last edit isn't lost. */
  flush(): void;
  /** Clears the saved layout and cancels any pending write. */
  reset(): void;
}

export interface CreateLayoutStoreOptions extends LayoutCodecOptions {
  key?: string;
  debounceMs?: number;
}

function safeRemove(storage: KeyValueStorage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    /* storage may be unavailable (privacy mode) — nothing to clean up */
  }
}

export function createLayoutStore(
  storage: KeyValueStorage | null,
  options: CreateLayoutStoreOptions,
): LayoutStore {
  const key = options.key ?? DEFAULT_KEY;
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Model | null = null;

  const commit = () => {
    timer = null;
    if (!pending || !storage) return;
    try {
      storage.setItem(key, serializeLayout(pending.toJson(), options.version));
    } catch (e) {
      console.error("Failed to save builder layout:", e);
    }
    pending = null;
  };

  const load = (buildDefault: () => IJsonModel): Model => {
    const fallback = () => Model.fromJson(buildDefault());
    if (!storage) return fallback();

    let raw: string | null = null;
    try {
      raw = storage.getItem(key);
    } catch {
      return fallback();
    }

    const json = parseLayout(raw, options);
    if (!json) {
      // Drop a rejected/corrupt entry so we don't re-validate it every load.
      if (raw !== null) safeRemove(storage, key);
      return fallback();
    }

    try {
      return Model.fromJson(json);
    } catch (e) {
      console.warn("Saved builder layout failed to construct; resetting.", e);
      safeRemove(storage, key);
      return fallback();
    }
  };

  const save = (model: Model) => {
    pending = model;
    if (timer) clearTimeout(timer);
    timer = setTimeout(commit, debounceMs);
  };

  const flush = () => {
    if (timer) clearTimeout(timer);
    commit();
  };

  const reset = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    pending = null;
    if (storage) safeRemove(storage, key);
  };

  return { load, save, flush, reset };
}

/** The browser's localStorage, or null when unavailable (SSR / privacy mode). */
export function browserStorage(): KeyValueStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const ls = window.localStorage;
    const probe = "__rve_probe__";
    ls.setItem(probe, "1");
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

/** An in-memory KeyValueStorage — SSR fallback, and handy in tests. */
export function memoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}
