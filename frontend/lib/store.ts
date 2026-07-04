import { create } from 'zustand';
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
  sessionId: string | null;
  sidebarCollapsed: boolean;

  // Data
  assets: AssetSummary[];
  selectedBond: AssetSummary | null; 
  auditResult: AuditResult | null;
  hedgingResult: HedgingStrategy | null;
  searchResults: SearchResult[];
  healthStatus: HealthStatus | null;
  bondAnalysis: BondAnalysis | null;
  agentMessages: ChatMessage[];
  lastSearchQuery: string | null;
  selectedBondId: string | null;
  activeAsset: AssetSummary | null;

  // Statuses
  auditStatus: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  hedgingStatus: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

  // State Management
  loading: Record<'search' | 'upload' | 'audit' | 'hedging' | 'agent', boolean>;
  errors: Record<'search' | 'upload' | 'audit' | 'hedging' | 'agent', string | undefined>;

  // Actions
  setAssets: (assets: AssetSummary[]) => void;
  setSelectedBond: (bond: AssetSummary | null) => void; // Accept the full object
  setThreadId: (id: string | null) => void;
  setSessionId: (id: string | null) => void;
  setAuditResult: (data: AuditResult | null) => void;
  setHedgingResult: (data: HedgingStrategy | null) => void;
  setSearchResults: (results: SearchResult[], query?: string) => void;
  setLoading: (key: keyof AppStore['loading'], status: boolean) => void;
  setError: (key: keyof AppStore['errors'], message?: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAgentMessages: (messages: ChatMessage[]) => void;
  setBondAnalysis: (data: BondAnalysis | null) => void;
  setAuditStatus: (status: AppStore['auditStatus']) => void;
  setHedgingStatus: (status: AppStore['hedgingStatus']) => void;
  setHealthStatus: (status: HealthStatus) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  threadId: null,
  sessionId: null,
  sidebarCollapsed: false,
  assets: [],
  selectedBond: null, 
  auditResult: null,
  hedgingResult: null,
  searchResults: [],
  healthStatus: null,
  bondAnalysis: null,
  agentMessages: [],
  auditStatus: 'IDLE',
  hedgingStatus: 'IDLE',
  lastSearchQuery: null,
  selectedBondId: null,
  activeAsset: null,

  loading: { search: false, upload: false, audit: false, hedging: false, agent: false },
  errors: { search: undefined, upload: undefined, audit: undefined, hedging: undefined, agent: undefined },

  // Actions
  setAssets: (assets) => set({ assets }),
  setThreadId: (threadId) => set({ threadId }),
  setSelectedBond: (bond) => set({ activeAsset: bond, selectedBondId: bond ? String(bond.id) : null }),  
  setSessionId: (sessionId) => set({ sessionId }),
  setAuditResult: (data) => set({ auditResult: data }),
  setHedgingResult: (data) => set({ hedgingResult: data }),
  setSearchResults: (results, query) => set({ searchResults: results, lastSearchQuery: query || null }),
  setLoading: (key, status) => set((state) => ({ loading: { ...state.loading, [key]: status } })),
  setError: (key, message) => set((state) => ({ errors: { ...state.errors, [key]: message } })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setAgentMessages: (agentMessages) => set({ agentMessages }),
  setBondAnalysis: (bondAnalysis) => set({ bondAnalysis }),
  setAuditStatus: (auditStatus) => set({ auditStatus }),
  setHedgingStatus: (hedgingStatus) => set({ hedgingStatus }),
  setHealthStatus: (healthStatus) => set({ healthStatus }),
  
  reset: () => set({
    selectedBond: null,
    selectedBondId: null,
    auditResult: null,
    hedgingResult: null,
    searchResults: [],
  }),
}));