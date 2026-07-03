// --- Existing ---
export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'information';
  message?: string;
  timestamp: string;
}

export interface AssetSearchQuery {
  query: string;
  limit?: number;
}

export interface UnderwriteInput {
  isin: string;
  instruction: string;
}

export interface AgentQueryInput {
  user_query: string;
  thread_id?: string;
}

// --- New Additions ---

// Chat Structure for the Agent
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Audit Result Structure
export interface AuditResult {
  riskScore: number;
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
  findings: string[];
  lastUpdated: string;
}

// Hedging Strategy Structure
export interface HedgingStrategy {
  instrument: string;
  hedgeRatio: number;
  costEstimate: number;
  recommendation: string;
}

// Search Result Structure
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'asset' | 'bond' | 'document';
  relevanceScore: number;
}

// Asset Summary for Dashboards
export interface AssetSummary {
    id: number;
    isin: string;
    asset_name: string;
    bond_type: string;
    credit_rating: string;
    coupon_rate: number;
}

export interface BondAnalysis {
  isin: string;
  creditRating: string;
  riskMetrics: {
    duration: number;
    convexity: number;
    yieldToMaturity: number;
  };
  recommendation: 'buy' | 'hold' | 'sell';
  analysisDate: string;
}