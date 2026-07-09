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
  ClimateVarResult,
  ComplianceResult,
  ExpectedLossResult,
  ValuationRow,
} from '@/lib/types';

interface AppStore {
  // Session
  threadId: string | null;
  sessionId: string | null;
  sidebarCollapsed: boolean;

  // Data
  assets: AssetSummary[];
  selectedBond: AssetSummary | null;
  activeAsset: AssetSummary | null;

  healthStatus: HealthStatus | null;
  searchResults: SearchResult[];
  lastSearchQuery: string | null;

  // Chat Agent
  agentMessages: ChatMessage[];
  agentInputValue: string;

  // =====================================================================
  // UPDATED: Unified Tool Execution States
  // =====================================================================
  bondAnalysis: BondAnalysis | null;          // "analyze_bond"
  hedgingResult: HedgingStrategy | null;      // "hedging"
  auditResult: AuditResult | null;            // "executeUnderwriting"
  climateVarResult: ClimateVarResult | null;               // "climate_var" (NEW)
  complianceResult: ComplianceResult | null;               // "green_compliance" (NEW)
  expectedLossResult: ExpectedLossResult | null;             // "expected_loss" (NEW)
  valuationTable: ValuationRow[] | null;               // "valuation_table" (NEW)


  // Status
  auditStatus: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  hedgingStatus: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

  // EXTENDED: Added generic 'tool' key to cover ad-hoc button executions
  loading: Record<
    'search' | 'upload' | 'audit' | 'hedging' | 'agent' | 'tool',
    boolean
  >;

  errors: Record<
    'search' | 'upload' | 'audit' | 'hedging' | 'agent' | 'tool',
    string | undefined
  >;

  // Actions
  setAssets: (assets: AssetSummary[]) => void;
  setSelectedBond: (bond: AssetSummary | null) => void;

  setThreadId: (id: string | null) => void;
  setSessionId: (id: string | null) => void;

  setHealthStatus: (status: HealthStatus | null) => void;

  setSearchResults: (results: SearchResult[], query?: string) => void;

  // =====================================================================
  // NEW: Streaming Chat & Ad-hoc Setters
  // =====================================================================
  setAgentMessages: (messages: ChatMessage[]) => void;
  addAgentMessage: (message: ChatMessage) => void; // Quick array append
  appendAgentStreamChunk: (textChunk: string) => void; // Appends incoming tokens
  setAgentInputValue: (value: string) => void;

  setBondAnalysis: (analysis: BondAnalysis | null) => void;
  setHedgingResult: (result: HedgingStrategy | null) => void;
  setAuditResult: (result: AuditResult | null) => void;
  setClimateVarResult: (result: ClimateVarResult | null) => void;
  setComplianceResult: (result: ComplianceResult | null) => void;
  setExpectedLossResult: (result: ExpectedLossResult | null) => void;
  setValuationTable: (data: ValuationRow[] | null) => void;

  setAuditStatus: (status: AppStore['auditStatus']) => void;
  setHedgingStatus: (status: AppStore['hedgingStatus']) => void;

  setLoading: (key: keyof AppStore['loading'], value: boolean) => void;
  setError: (key: keyof AppStore['errors'], message?: string) => void;

  setSidebarCollapsed: (collapsed: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Session
  threadId:crypto.randomUUID(),
  sessionId: null,
  sidebarCollapsed: false,

  // Data
  assets: [],
  selectedBond: null,
  activeAsset: null,

  healthStatus: null,
  searchResults: [],
  lastSearchQuery: null,

  agentMessages: [],
  agentInputValue: '',

  // Tool Outputs
  bondAnalysis: null,
  hedgingResult: null,
  auditResult: null,
  climateVarResult: null,
  complianceResult: null,
  expectedLossResult: null,
  valuationTable: null,


  // Status
  auditStatus: 'IDLE',
  hedgingStatus: 'IDLE',

  loading: {
    search: false,
    upload: false,
    audit: false,
    hedging: false,
    agent: false,
    tool: false, // Initialized
  },

  errors: {
    search: undefined,
    upload: undefined,
    audit: undefined,
    hedging: undefined,
    agent: undefined,
    tool: undefined, // Initialized
  },

  // Actions
  setAssets: (assets) => set({ assets }),

  setSelectedBond: (bond) =>
    set({
      selectedBond: bond,
      activeAsset: bond,
    }),

  setThreadId: (threadId) => set({ threadId }),
  setSessionId: (sessionId) => set({ sessionId }),
  setHealthStatus: (healthStatus) => set({ healthStatus }),

  setSearchResults: (searchResults, query) =>
    set({
      searchResults,
      lastSearchQuery: query ?? null,
    }),

  // Chat Mechanics
  setAgentMessages: (agentMessages) => set({ agentMessages }),
  
  addAgentMessage: (message) => 
    set((state) => ({ agentMessages: [...state.agentMessages, message] })),

  appendAgentStreamChunk: (textChunk) =>
    set((state) => {
      const messages = [...state.agentMessages];
      if (messages.length === 0) return { agentMessages: messages };
      
      const lastMessage = { ...messages[messages.length - 1] };
      // Safely append text to the active streaming assistant target message block
      if (lastMessage.role === "assistant") {
            lastMessage.content += textChunk;
        }
      messages[messages.length - 1] = lastMessage;
      
      return { agentMessages: messages };
    }),

  setAgentInputValue: (agentInputValue) => set({ agentInputValue }),

  // Tool State Setters
  setBondAnalysis: (bondAnalysis) => set({ bondAnalysis }),
  setHedgingResult: (hedgingResult) => set({ hedgingResult }),
  setAuditResult: (auditResult) => set({ auditResult }),
  setClimateVarResult: (climateVarResult) => set({ climateVarResult }),
  setComplianceResult: (complianceResult) => set({ complianceResult }),
  setExpectedLossResult: (expectedLossResult) => set({ expectedLossResult }),
  setValuationTable: (valuationTable) => set({ valuationTable }),

  setAuditStatus: (auditStatus) => set({ auditStatus }),
  setHedgingStatus: (hedgingStatus) => set({ hedgingStatus }),

  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (key, message) =>
    set((state) => ({
      errors: { ...state.errors, [key]: message },
    })),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  reset: () =>
    set({
      threadId: crypto.randomUUID(),
      selectedBond: null,
      activeAsset: null,

      bondAnalysis: null,
      hedgingResult: null,
      auditResult: null,
      climateVarResult: null,
      complianceResult: null,
      expectedLossResult: null,
      valuationTable: null,

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
        tool: false,
      },

      errors: {
        search: undefined,
        upload: undefined,
        audit: undefined,
        hedging: undefined,
        agent: undefined,
        tool: undefined,
      },
    }),
}));