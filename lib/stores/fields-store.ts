import { create } from "zustand";
import type { FieldDef } from "../domain/types";

export interface FieldCatalogGroup {
  group: string;
  fields: FieldDef[];
}

interface FieldsStore {
  fields: FieldDef[];
  groups: FieldCatalogGroup[];
  enums: Record<string, string[]>;
  operatorGroups: Record<string, string[]>;
  rootVars: string[];
  isLoading: boolean;
  error: string | null;
  isLoaded: boolean;

  setFields: (fields: FieldDef[]) => void;
  setConfig: (config: {
    fields: FieldDef[];
    enums: Record<string, string[]>;
    operatorGroups: Record<string, string[]>;
    rootVars: string[];
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const groupFields = (fields: FieldDef[]): FieldCatalogGroup[] => {
  const map = new Map<string, FieldDef[]>();
  for (const f of fields) {
    const parts = f.path.split(".");
    const group = parts.length > 1 ? parts[0] : "Other";
    const g = group.charAt(0).toUpperCase() + group.slice(1);
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(f);
  }
  return Array.from(map.entries()).map(([group, fields]) => ({
    group,
    fields,
  }));
};

export const useFieldsStore = create<FieldsStore>((set) => ({
  fields: [],
  groups: [],
  enums: {},
  operatorGroups: {},
  rootVars: [],
  isLoading: false,
  error: null,
  isLoaded: false,

  setFields: (fields) =>
    set({ fields, groups: groupFields(fields), isLoaded: true }),

  setConfig: ({ fields, enums, operatorGroups, rootVars }) =>
    set({
      fields,
      groups: groupFields(fields),
      enums,
      operatorGroups,
      rootVars,
      isLoaded: true,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoaded: false }),
}));
