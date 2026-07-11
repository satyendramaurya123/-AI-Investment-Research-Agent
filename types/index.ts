// ============================================================
// Core Company Data Types
// ============================================================

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  description: string;
  ceo: string;
  sector: string;
  industry: string;
  country: string;
  headquarters: string;
  website: string;
  logo: string;
  employees: number;
  exchange: string;
  currency: string;
  ipoDate: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  pe: number;
  eps: number;
  sharesOutstanding: number;
}

export interface FinancialMetrics {
  revenue: number;
  revenueGrowth: number;
  netIncome: number;
  netIncomeGrowth: number;
  grossProfit: number;
  grossMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
  eps: number;
  epsGrowth: number;
  freeCashFlow: number;
  operatingCashFlow: number;
  totalDebt: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  roe: number;
  roa: number;
  roic: number;
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  evEbitda: number;
  dividendYield: number;
}

export interface HistoricalRevenue {
  year: string;
  revenue: number;
  netIncome: number;
  eps: number;
}

// ============================================================
// AI Agent Result Types
// ============================================================

export interface FinancialAnalysisResult {
  score: number; // 0-100
  revenue: { value: number; trend: string; score: number };
  profitability: { value: number; trend: string; score: number };
  growth: { value: number; trend: string; score: number };
  cashFlow: { value: number; trend: string; score: number };
  debt: { value: number; trend: string; score: number };
  valuation: { value: number; trend: string; score: number };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  historicalData: HistoricalRevenue[];
}

export interface BusinessAnalysisResult {
  score: number; // 0-100
  businessModel: string;
  competitiveAdvantage: string;
  marketPosition: string;
  products: string[];
  keyStrengths: string[];
  marketOpportunities: string[];
  swot: SWOTAnalysis;
  summary: string;
}

export interface RiskAnalysisResult {
  score: number; // 0-100 (higher = lower risk)
  overallRisk: "low" | "medium" | "high";
  competitionRisk: RiskFactor;
  debtRisk: RiskFactor;
  regulatoryRisk: RiskFactor;
  geopoliticalRisk: RiskFactor;
  marketRisk: RiskFactor;
  operationalRisk: RiskFactor;
  topRisks: string[];
  mitigations: string[];
  summary: string;
}

export interface RiskFactor {
  level: "low" | "medium" | "high";
  score: number; // 0-100 (higher = more risky)
  description: string;
}

export type InvestmentDecision = "invest" | "hold" | "pass";

export interface InvestmentDecisionResult {
  decision: InvestmentDecision;
  overallScore: number; // 0-100
  confidence: number; // 0-100 percent
  financialScore: number;
  businessScore: number;
  riskScore: number;
  pros: string[];
  cons: string[];
  summary: string;
  detailedReasoning: string;
  priceTarget?: number;
  timeHorizon?: string;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// ============================================================
// Complete Analysis Result (Final Output)
// ============================================================

export interface AnalysisResult {
  // Company Info
  company: string;
  symbol: string;
  logo: string;
  sector: string;
  industry: string;
  ceo: string;
  headquarters: string;
  description: string;
  website: string;
  exchange: string;
  currency: string;

  // Stock Data
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  high52Week: number;
  low52Week: number;
  pe: number;
  eps: number;

  // Financial Data
  revenue: number;
  netIncome: number;
  grossMargin: number;
  netMargin: number;
  roe: number;
  debtToEquity: number;
  freeCashFlow: number;

  // Agent Scores
  financialScore: number;
  businessScore: number;
  riskScore: number;
  overallScore: number;

  // Decision
  decision: InvestmentDecision;
  confidence: number;

  // Detailed Analysis
  pros: string[];
  cons: string[];
  summary: string;
  detailedReasoning: string;
  swot: SWOTAnalysis;
  historicalRevenue: HistoricalRevenue[];

  // Agent Outputs
  financialAnalysis: FinancialAnalysisResult;
  businessAnalysis: BusinessAnalysisResult;
  riskAnalysis: RiskAnalysisResult;

  // Meta
  analyzedAt: string;
  dataSource: string;
  // Set when the AI could not be reached at all (e.g. bad/missing API key,
  // model unavailable) — the rest of the result will be generic fallback
  // data in that case, so the UI should surface this prominently.
  warning?: string;
}

// ============================================================
// API Request / Response Types
// ============================================================

export interface AnalyzeRequest {
  company: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

// ============================================================
// History Types
// ============================================================

export interface SearchHistoryItem {
  id: string;
  company: string;
  symbol: string;
  decision: InvestmentDecision;
  overallScore: number;
  confidence: number;
  analyzedAt: string;
  logo?: string;
}

// ============================================================
// UI State Types
// ============================================================

export type AnalysisStatus =
  | "idle"
  | "loading"
  | "financial"
  | "business"
  | "risk"
  | "decision"
  | "complete"
  | "error";

export interface AnalysisProgress {
  status: AnalysisStatus;
  step: number;
  totalSteps: number;
  message: string;
  percentage: number;
}

export type TabValue =
  | "overview"
  | "financial"
  | "business"
  | "risk"
  | "decision";
