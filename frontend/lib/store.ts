import { create } from 'zustand';

// Assuming you have a types.ts file for these interfaces
import { 
  AuditResult, 
  HedgingStrategy, 
  SearchResult, 
  AssetSummary, 
  HealthStatus,
  ChatMessage,
  BondAnalysis
} from '@/lib/types';

interface AppStore {
  // Session
  threadId: string | null;
  selectedBondId: string | null;
  selectedISIN: string | null;
  agentMessages: ChatMessage[];
  bondAnalysis: BondAnalysis | null;
 
  

  // Data
  auditResult: AuditResult | null;
  hedgingResult: HedgingStrategy | null;
  searchResults: SearchResult[];
  assets: AssetSummary[];
  healthStatus: HealthStatus | null;

  // Metadata
  lastAuditTime: Date | null;
  lastSearchQuery: string | null;

  // Loading States
  loading: {
    search: boolean;
    upload: boolean;
    audit: boolean;
    hedging: boolean;
    agent: boolean;
  };

  // Error States
  errors: {
    search?: string;
    upload?: string;
    audit?: string;
    hedging?: string;
    agent?: string;
  };

  // UI State
  sidebarCollapsed: boolean;

  // Actions
  setThreadId: (id: string | null) => void;
  setSelectedBond: (id: string | null, isin?: string | null) => void;
  setAuditResult: (data: AuditResult | null) => void;
  setHedgingResult: (data: HedgingStrategy | null) => void;
  setSearchResults: (results: SearchResult[], query?: string) => void;
  setLoading: (key: keyof AppStore['loading'], status: boolean) => void;
  setError: (key: keyof AppStore['errors'], message?: string) => void;
  setAssets: (assets: AssetSummary[]) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAgentMessages: (messages: ChatMessage[]) => void;
  setBondAnalysis: (data: BondAnalysis | null) => void;
  setHealthStatus: (status: HealthStatus) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  threadId: null,
  selectedBondId: null,
  selectedISIN: null,
  auditResult: null,
  hedgingResult: null,
  searchResults: [],
  assets: [],
  healthStatus: null,
  lastAuditTime: null,
  lastSearchQuery: null,
  sidebarCollapsed: false,
  agentMessages: [],
  bondAnalysis: null,
  

  loading: {
    search: false,
    upload: false,
    audit: false,
    hedging: false,
    agent: false,
  },

  errors: {},

  setAssets: (assets) => set({ assets }),

  setHealthStatus: (healthStatus) => set({ healthStatus }),

  setBondAnalysis: (bondAnalysis) => set({ bondAnalysis }),

  setAgentMessages: (agentMessages) => set({ agentMessages }),

  setThreadId: (threadId) => set({ threadId }),

  setSelectedBond: (selectedBondId, selectedISIN = null) => 
    set({ selectedBondId, selectedISIN }),

  setAuditResult: (data) => set({ auditResult: data, lastAuditTime: data ? new Date() : null }),

  setHedgingResult: (data) => set({ hedgingResult: data }),

  setSearchResults: (results, query) => 
    set({ searchResults: results, lastSearchQuery: query || null }),

  setLoading: (key, status) =>
    set((state) => ({
      loading: { ...state.loading, [key]: status },
    })),

  setError: (key, message) =>
    set((state) => ({
      errors: { ...state.errors, [key]: message },
    })),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  reset: () =>
    set({
      selectedBondId: null,
      selectedISIN: null,
      auditResult: null,
      hedgingResult: null,
      searchResults: [],
      loading: { search: false, upload: false, audit: false, hedging: false, agent: false },
      errors: {},
    }),
}));