'use client';

import { create } from 'zustand';
import {
  AuditResult,
  HedgingStrategy,
  SearchResult,
  AssetSummary,
  HealthStatus,
  ChatMessage,
  BondAnalysis,
} from '@/lib/types';

interface AppStore {
  // Session
  threadId: string | null;
  sessionId: string |null;
  sidebarCollapsed: boolean;

  // Data
  assets: AssetSummary[];
  selectedBond: AssetSummary | null;
  activeAsset: AssetSummary | null;

  auditResult: AuditResult | null;
  hedgingResult: HedgingStrategy | null;
  bondAnalysis: BondAnalysis | null;

  healthStatus: HealthStatus | null;

  searchResults: SearchResult[];
  lastSearchQuery: string | null;

  agentMessages: ChatMessage[];
  agentInputValue: string;

  selectedBondId: string | null;

  // Status
  auditStatus: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  hedgingStatus: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

  loading: Record<
    'search' | 'upload' | 'audit' | 'hedging' | 'agent',
    boolean
  >;

  errors: Record<
    'search' | 'upload' | 'audit' | 'hedging' | 'agent',
    string | undefined
  >;

  // Actions
  setAssets: (assets: AssetSummary[]) => void;
  setSelectedBond: (bond: AssetSummary | null) => void;

  setThreadId: (id: string | null) => void;
  setSessionId: (id: string | null) => void;

  setAuditResult: (result: AuditResult | null) => void;
  setAuditStatus: (status: AppStore['auditStatus']) => void;

  setHedgingResult: (result: HedgingStrategy | null) => void;
  setHedgingStatus: (status: AppStore['hedgingStatus']) => void;

  setBondAnalysis: (analysis: BondAnalysis | null) => void;

  setHealthStatus: (status: HealthStatus | null) => void;

  setSearchResults: (
    results: SearchResult[],
    query?: string
  ) => void;

  setAgentMessages: (messages: ChatMessage[]) => void;
  setAgentInputValue: (value: string) => void;

  setLoading: (
    key: keyof AppStore['loading'],
    value: boolean
  ) => void;

  setError: (
    key: keyof AppStore['errors'],
    message?: string
  ) => void;

  setSidebarCollapsed: (collapsed: boolean) => void;

  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Session
  threadId: null,
  sessionId: null,
  sidebarCollapsed: false,

  // Data
  assets: [],
  selectedBond: null,
  activeAsset: null,

  auditResult: null,
  hedgingResult: null,
  bondAnalysis: null,

  healthStatus: null,

  searchResults: [],
  lastSearchQuery: null,

  agentMessages: [],
  agentInputValue: '',

  selectedBondId: null,

  // Status
  auditStatus: 'IDLE',
  hedgingStatus: 'IDLE',

  loading: {
    search: false,
    upload: false,
    audit: false,
    hedging: false,
    agent: false,
  },

  errors: {
    search: undefined,
    upload: undefined,
    audit: undefined,
    hedging: undefined,
    agent: undefined,
  },

  // Actions

  setAssets: (assets) =>
    set({ assets }),

  setSelectedBond: (bond) =>
    set({
      selectedBond: bond,
      activeAsset: bond,
      selectedBondId: bond ? String(bond.id) : null,
    }),

  setThreadId: (threadId) =>
    set({ threadId }),

  setSessionId: (sessionId) =>
    set({ sessionId }),

  setAuditResult: (auditResult) =>
    set({ auditResult }),

  setAuditStatus: (auditStatus) =>
    set({ auditStatus }),

  setHedgingResult: (hedgingResult) =>
    set({ hedgingResult }),

  setHedgingStatus: (hedgingStatus) =>
    set({ hedgingStatus }),

  setBondAnalysis: (bondAnalysis) =>
    set({ bondAnalysis }),

  setHealthStatus: (healthStatus) =>
    set({ healthStatus }),

  setSearchResults: (searchResults, query) =>
    set({
      searchResults,
      lastSearchQuery: query ?? null,
    }),

  setAgentMessages: (agentMessages) =>
    set({ agentMessages }),

  setAgentInputValue: (agentInputValue) =>
    set({ agentInputValue }),

  setLoading: (key, value) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: value,
      },
    })),

  setError: (key, message) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [key]: message,
      },
    })),

  setSidebarCollapsed: (sidebarCollapsed) =>
    set({ sidebarCollapsed }),

  reset: () =>
    set({
      selectedBond: null,
      activeAsset: null,
      selectedBondId: null,

      auditResult: null,
      hedgingResult: null,
      bondAnalysis: null,

      searchResults: [],
      lastSearchQuery: null,

      agentMessages: [],
      agentInputValue: '',

      auditStatus: 'IDLE',
      hedgingStatus: 'IDLE',

      loading: {
        search: false,
        upload: false,
        audit: false,
        hedging: false,
        agent: false,
      },

      errors: {
        search: undefined,
        upload: undefined,
        audit: undefined,
        hedging: undefined,
        agent: undefined,
      },
    }),
}));