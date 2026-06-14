import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EnforcementAction,
  EnforcementSeverity,
  RuleMode,
} from "../domain/types";

export interface Condition {
  type: "cond" | "group";
  field?: string;
  op?: string;
  value?: string;
  children?: Condition[];
}

export interface RuleDraft {
  identity: {
    code: string;
    name: string;
    description: string;
    version: string;
    author: string;
    tags: string[];
  };
  channels: string[];
  conditionTree: Condition;
  evaluationCondition: boolean | number | string | Record<string, unknown>;
  enforcement: {
    action: EnforcementAction;
    score_impact: number;
    severity: EnforcementSeverity;
    tags: string[];
    cooldown_seconds: number;
  };
  policy: {
    mode: RuleMode;
    rollout: number;
    schedule_from: string;
    schedule_to: string;
  };
}

interface RuleStore {
  draft: RuleDraft;
  activeSection: string;
  activeTab: "builder" | "code" | "summary" | "tree";
  codeView: "condition" | "jsonlogic";
  isDirty: boolean;
  ruleId: string | null;
  isSaving: boolean;
  saveError: string | null;

  setDraft: (partial: Partial<RuleDraft>) => void;
  setConditionTree: (tree: Condition) => void;
  setEvaluationCondition: (condition: boolean | number | string | Record<string, unknown>) => void;
  setIdentity: (identity: Partial<RuleDraft["identity"]>) => void;
  setEnforcement: (enforcement: Partial<RuleDraft["enforcement"]>) => void;
  setPolicy: (policy: Partial<RuleDraft["policy"]>) => void;
  setChannels: (channels: string[]) => void;
  setActiveSection: (section: string) => void;
  setActiveTab: (tab: "builder" | "code" | "summary" | "tree") => void;
  setCodeView: (view: "condition" | "jsonlogic") => void;
  setRuleId: (id: string | null) => void;
  setIsSaving: (saving: boolean) => void;
  setSaveError: (error: string | null) => void;
  markClean: () => void;
  resetDraft: () => void;
}

const defaultDraft: RuleDraft = {
  identity: {
    code: "",
    name: "",
    description: "",
    version: "1.0.0",
    author: "FraudOps",
    tags: [],
  },
  channels: ["web", "mobile"],
  conditionTree: {
    type: "group",
    op: "AND",
    children: [{ type: "cond", field: "", op: "=", value: "" }],
  },
  evaluationCondition: true,
  enforcement: {
    action: "review",
    score_impact: 5,
    severity: "moderate",
    tags: [],
    cooldown_seconds: 300,
  },
  policy: {
    mode: "staged",
    rollout: 100,
    schedule_from: "",
    schedule_to: "",
  },
};

export const useRuleStore = create<RuleStore>()(
  persist(
    (set) => ({
      draft: { ...defaultDraft, identity: { ...defaultDraft.identity }, enforcement: { ...defaultDraft.enforcement }, policy: { ...defaultDraft.policy } },
      activeSection: "conditions",
      activeTab: "builder",
      codeView: "condition",
      isDirty: false,
      ruleId: null,
      isSaving: false,
      saveError: null,

      setDraft: (partial) =>
        set((state) => ({
          draft: { ...state.draft, ...partial },
          isDirty: true,
        })),

      setActiveSection: (section) => set({ activeSection: section }),

      setConditionTree: (tree) =>
        set((state) => ({
          draft: { ...state.draft, conditionTree: tree },
          isDirty: true,
        })),

      setEvaluationCondition: (condition) =>
        set((state) => ({
          draft: { ...state.draft, evaluationCondition: condition },
          isDirty: true,
        })),

      setIdentity: (identity) =>
        set((state) => ({
          draft: {
            ...state.draft,
            identity: { ...state.draft.identity, ...identity },
          },
          isDirty: true,
        })),

      setEnforcement: (enforcement) =>
        set((state) => ({
          draft: {
            ...state.draft,
            enforcement: { ...state.draft.enforcement, ...enforcement },
          },
          isDirty: true,
        })),

      setPolicy: (policy) =>
        set((state) => ({
          draft: {
            ...state.draft,
            policy: { ...state.draft.policy, ...policy },
          },
          isDirty: true,
        })),

      setChannels: (channels) =>
        set((state) => ({
          draft: { ...state.draft, channels },
          isDirty: true,
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),
      setCodeView: (view) => set({ codeView: view }),
      setRuleId: (id) => set({ ruleId: id }),
      setIsSaving: (saving) => set({ isSaving: saving }),
      setSaveError: (error) => set({ saveError: error }),

      markClean: () => set({ isDirty: false, saveError: null }),

      resetDraft: () =>
        set({
          draft: {
            ...defaultDraft,
            identity: { ...defaultDraft.identity },
            enforcement: { ...defaultDraft.enforcement },
            policy: { ...defaultDraft.policy },
          },
          isDirty: false,
          ruleId: null,
          saveError: null,
        }),
    }),
    {
      name: "rve-platform:rule-store",
      partialize: (state) => ({
        draft: state.draft,
        activeSection: state.activeSection,
        activeTab: state.activeTab,
        codeView: state.codeView,
        ruleId: state.ruleId,
        isDirty: state.isDirty,
      }),
    }
  )
);
