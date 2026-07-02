// --- TypeScript Interfaces ---
export interface HealthStatus {
  status: string;
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
  message?: string;
  user_query: string;
  session_id?: string;
  asset_id?: string;
  thread_id?: string;
}
