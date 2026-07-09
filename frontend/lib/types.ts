// =====================================================================
// 1. System & Session Types
// =====================================================================

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'information';
  message?: string;
  timestamp: string;
}

// =====================================================================
// 2. API Request Payload Inputs
// =====================================================================

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
  thread_id : string;
}      

// =====================================================================
// 3. Conversational AI & Streaming Event Structure
// =====================================================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;    // Optional timestamp metadata tracking
}

/**
 * Discriminated Union for parsing Server-Sent Events (SSE) / NDJSON line streams
 * arriving from the unified LangChain streaming engine route.
 */
export type AgentStreamEvent =
  | { type: 'text'; content: string }
  | { type: 'tool_start'; tool: string; input: Record<string, any> }
  | { type: 'tool_result'; tool: string; data: Record<string, any> };

// =====================================================================
// 4. Standalone Tool Response Payloads (Ad-hoc UI Metrics Execution)
// =====================================================================

/**
 * Output signature returned from actuarial_expected_loss_tool
 */
export interface ExpectedLossResult {
  bond_isin: string;
  asset_name: string;
  bond_type: string;
  computed_loss_severity_coefficient: number;
  annualized_hazard_probability: number;
  expected_annual_loss_usd: number;
}

/**
 * Output signature returned from climate_value_at_risk_tool
 */
export interface ClimateVarResult {
  bond_isin: string;
  asset_name: string;
  bond_type: string;
  credit_rating: string;
  market_volatility_used: number;
  physical_risk_score_used: number;
  base_value_at_risk?: number;
  climate_adjusted_var?: number;
  [key: string]: any; // Catch-all for supplementary structural engine metadata variants
}

/**
 * Output signature returned from green_compliance_verification_tool
 */
export interface ComplianceResult {
  is_compliant: boolean;
  compliance_rating?: string;
  passed_milestones_count: number;
  failed_milestones: string[];
  evaluation_summary: string;
}

/**
 * Single historical timeline data plot entry from get_asset_valuation
 */
export interface ValuationRow {
  Date: string;      // Formatted precisely as "YYYY-MM-DD"
  Valuation: number; // Cast directly into a JavaScript number float primitive
}

// =====================================================================
// 5. Heavy Financial Analysis & Data Structures
// =====================================================================

export interface AuditResult {
  riskScore: number;
  complianceStatus: "compliant" | "review" | "non-compliant";
  findings: string[];
  optimizationNotes: string[];
}

export interface HedgingStrategy {
  hedge_option: {
    recommended: boolean;
    option_style: string;
    model_name: string;
    recommended_at: string;
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
    rho: number;
  };
  playbook: {
    risk_assessment_summary: string;
    hedging_actionable_directives: string[];
    recommended_credit_default_swap_bps_buffer: number;
  };
}

export interface SearchResult {
  id: number;
  assetName: string;      
  snippet: string;        
  bondType: string;      
  score: number;          
  rating: string;         
  isin: string;           
  couponRate?: number;
}

export interface AssetSummary {
  id: number;
  isin: string;
  asset_name: string;
  bond_type: string;
  credit_rating: string;
  coupon_rate: number;
}

export interface BondAnalysis {
  creditRating: string;
  riskMetrics: {
    climateVar: number;
    expectedLoss: number;
    probabilityOfDefault: number;
    lossGivenDefault: number;
    overallScore: number;
  };
  marketMetrics: MarketMetrics;
  recommendation: "buy" | "hold" | "sell";
  climateMetrics: ClimateMetrics;
  transitionMetrics: TransitionMetrics;
  compliance: ComplianceResult;
}

export interface MarketMetrics {
  duration: number;
  yieldRate: number;
  spread: number;
  volatility: number;
  liquidityScore: number;
}

export interface ClimateMetrics {
  floodScore: number;
  wildfireScore: number;
  heatScore: number;
  droughtScore: number;
  overallPhysicalRisk: number;
  physicalRiskLevel: string;
}

export interface TransitionMetrics {
  carbonIntensity: number;
  industry: string;
  sector: string;
  country: string;
  euTaxonomyEligible: boolean;
  transitionRiskScore: number;
}