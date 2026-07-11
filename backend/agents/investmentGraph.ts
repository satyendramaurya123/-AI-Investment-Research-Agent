import type {
  CompanyProfile,
  StockQuote,
  FinancialMetrics,
  HistoricalRevenue,
  FinancialAnalysisResult,
  BusinessAnalysisResult,
  RiskAnalysisResult,
  InvestmentDecisionResult,
  AnalysisResult,
} from "@/types";
import {
  fetchAllCompanyData,
} from "@backend/services/financialService";
import { runFinancialAgent } from "@backend/agents/financialAgent";
import { runBusinessAgent } from "@backend/agents/businessAgent";
import { runRiskAgent } from "@backend/agents/riskAgent";
import { runDecisionAgent } from "@backend/agents/decisionAgent";

// ============================================================
// State type — passed through each node manually.
// ============================================================

interface InvestmentWorkflowState {
  // Input
  companyName: string;

  // Resolved market data
  symbol: string;
  companyProfile: CompanyProfile | null;
  stockQuote: StockQuote | null;
  financialMetrics: FinancialMetrics | null;
  historicalRevenue: HistoricalRevenue[];

  // Agent outputs
  financialAnalysis: FinancialAnalysisResult | null;
  businessAnalysis: BusinessAnalysisResult | null;
  riskAnalysis: RiskAnalysisResult | null;
  investmentDecision: InvestmentDecisionResult | null;

  // Meta
  errors: string[];
  currentStep: string;
}

function initialState(companyName: string): InvestmentWorkflowState {
  return {
    companyName,
    symbol: "",
    companyProfile: null,
    stockQuote: null,
    financialMetrics: null,
    historicalRevenue: [],
    financialAnalysis: null,
    businessAnalysis: null,
    riskAnalysis: null,
    investmentDecision: null,
    errors: [],
    currentStep: "initializing",
  };
}

// ============================================================
// Node 1: Data Collection
// ============================================================

async function collectDataNode(
  state: InvestmentWorkflowState
): Promise<InvestmentWorkflowState> {
  const { companyName } = state;
  const errors: string[] = [];

  // Single LLM call fetches symbol + profile + quote + metrics +
  // historical revenue together. This used to be 5 separate calls —
  // consolidated to conserve the LLM API's daily free-tier request quota.
  const {
    symbol,
    profile: companyProfile,
    quote: stockQuote,
    metrics: financialMetrics,
    historicalRevenue,
  } = await fetchAllCompanyData(companyName);

  if (!companyProfile) {
    errors.push("Company data fetch failed — see server logs for the LLM API error.");
  }

  return {
    ...state,
    symbol,
    companyProfile,
    stockQuote,
    financialMetrics,
    historicalRevenue,
    errors: [...state.errors, ...errors],
    currentStep: "financial_analysis",
  };
}

// ============================================================
// Node 2: Financial Analysis
// ============================================================

async function financialAnalysisNode(
  state: InvestmentWorkflowState
): Promise<InvestmentWorkflowState> {
  const errors: string[] = [];
  let financialAnalysis: FinancialAnalysisResult | null = null;

  try {
    financialAnalysis = await runFinancialAgent(
      state.companyName,
      state.financialMetrics,
      state.stockQuote,
      state.historicalRevenue
    );
  } catch (e) {
    errors.push(`Financial analysis failed: ${e}`);
  }

  return {
    ...state,
    financialAnalysis,
    errors: [...state.errors, ...errors],
    currentStep: "business_analysis",
  };
}

// ============================================================
// Node 3: Business Analysis
// ============================================================

async function businessAnalysisNode(
  state: InvestmentWorkflowState
): Promise<InvestmentWorkflowState> {
  const errors: string[] = [];
  let businessAnalysis: BusinessAnalysisResult | null = null;

  try {
    businessAnalysis = await runBusinessAgent(
      state.companyName,
      state.companyProfile
    );
  } catch (e) {
    errors.push(`Business analysis failed: ${e}`);
  }

  return {
    ...state,
    businessAnalysis,
    errors: [...state.errors, ...errors],
    currentStep: "risk_analysis",
  };
}

// ============================================================
// Node 4: Risk Analysis
// ============================================================

async function riskAnalysisNode(
  state: InvestmentWorkflowState
): Promise<InvestmentWorkflowState> {
  const errors: string[] = [];
  let riskAnalysis: RiskAnalysisResult | null = null;

  try {
    riskAnalysis = await runRiskAgent(
      state.companyName,
      state.companyProfile,
      state.financialMetrics
    );
  } catch (e) {
    errors.push(`Risk analysis failed: ${e}`);
  }

  return {
    ...state,
    riskAnalysis,
    errors: [...state.errors, ...errors],
    currentStep: "investment_decision",
  };
}

// ============================================================
// Node 5: Investment Decision
// ============================================================

async function investmentDecisionNode(
  state: InvestmentWorkflowState
): Promise<InvestmentWorkflowState> {
  const errors: string[] = [];
  let investmentDecision: InvestmentDecisionResult | null = null;

  if (!state.financialAnalysis || !state.businessAnalysis || !state.riskAnalysis) {
    errors.push("One or more agent outputs missing — using fallback decision.");
  }

  try {
    investmentDecision = await runDecisionAgent(
      state.companyName,
      state.symbol,
      state.financialAnalysis ?? createFallbackFinancial(),
      state.businessAnalysis ?? createFallbackBusiness(),
      state.riskAnalysis ?? createFallbackRisk(),
      state.stockQuote
    );
  } catch (e) {
    errors.push(`Decision agent failed: ${e}`);
  }

  return {
    ...state,
    investmentDecision,
    errors: [...state.errors, ...errors],
    currentStep: "complete",
  };
}

// ============================================================
// Pipeline runner
// ============================================================

async function runPipeline(
  companyName: string
): Promise<InvestmentWorkflowState> {
  let state = initialState(companyName);

  state = await collectDataNode(state);

  // financial/business/risk analysis are independent of each other —
  // run them in parallel instead of one-after-another. Sequentially, each
  // LLM call could take 5-20s+, so doing this in series (as before)
  // could push total wait time past a minute, which is what made the UI
  // look permanently "stuck in progress".
  const [financialState, businessState, riskState] = await Promise.all([
    financialAnalysisNode(state),
    businessAnalysisNode(state),
    riskAnalysisNode(state),
  ]);

  state = {
    ...state,
    financialAnalysis: financialState.financialAnalysis,
    businessAnalysis: businessState.businessAnalysis,
    riskAnalysis: riskState.riskAnalysis,
    errors: [
      ...state.errors,
      ...financialState.errors.slice(state.errors.length),
      ...businessState.errors.slice(state.errors.length),
      ...riskState.errors.slice(state.errors.length),
    ],
    currentStep: "investment_decision",
  };

  state = await investmentDecisionNode(state);

  return state;
}

// ============================================================
// Main Entry
// ============================================================

export async function runInvestmentResearch(
  companyName: string
): Promise<AnalysisResult> {
  const state = await runPipeline(companyName.trim());
  return assembleAnalysisResult(state);
}

// ============================================================
// Assemble final AnalysisResult from completed pipeline state
// ============================================================

function assembleAnalysisResult(
  state: InvestmentWorkflowState
): AnalysisResult {
  const { companyProfile: profile, stockQuote: quote, financialMetrics: metrics } =
    state;

  const financial = state.financialAnalysis ?? createFallbackFinancial();
  const business = state.businessAnalysis ?? createFallbackBusiness();
  const risk = state.riskAnalysis ?? createFallbackRisk();
  const decision =
    state.investmentDecision ?? createFallbackDecision(financial, business, risk);

  const logoUrl = profile?.logo || buildLogoUrl(profile?.website ?? state.symbol);

  // If any core agent fell back to defaults, the AI likely didn't respond
  // successfully for at least part of the analysis (bad/missing API key,
  // model unavailable, rate limit, malformed JSON, etc.) — surface the
  // *actual* underlying error instead of silently returning generic-looking
  // "HOLD" data that looks like a real analysis, and instead of just
  // guessing at a cause.
  const fellBack = {
    financial: !state.financialAnalysis,
    business: !state.businessAnalysis,
    risk: !state.riskAnalysis,
    decision: !state.investmentDecision,
  };
  const anyFellBack = Object.values(fellBack).some(Boolean);
  const allFellBack = Object.values(fellBack).every(Boolean);

  let warning: string | undefined;
  if (anyFellBack) {
    const failedParts = Object.entries(fellBack)
      .filter(([, failed]) => failed)
      .map(([name]) => name)
      .join(", ");
    // Pull the real error message(s) so the actual cause (invalid key,
    // 404 model not found, 429 rate limit, etc.) is visible directly in
    // the UI rather than requiring a trip to the server logs.
    const relevantErrors = state.errors
      .filter((e) => /analysis failed|agent failed|data fetch failed/i.test(e))
      .slice(0, 3);

    const isQuotaError = state.errors.some((e) => /429|quota|rate.?limit/i.test(e));

    const reason = isQuotaError
      ? "Groq's daily free-tier request quota has been used up for this API key. It resets every 24 hours, or you can check current usage / upgrade at https://console.groq.com/settings/billing"
      : relevantErrors.length > 0
        ? relevantErrors.join(" | ")
        : "no error was captured — check server logs";

    warning = allFellBack
      ? `AI analysis failed for every section — this is placeholder data, not a real analysis. Reason: ${reason}`
      : `AI analysis failed for: ${failedParts} — those sections show placeholder data. Reason: ${reason}`;
  }

  return {
    // Company Info
    company: profile?.companyName || state.companyName,
    symbol: state.symbol,
    logo: logoUrl,
    sector: profile?.sector || "N/A",
    industry: profile?.industry || "N/A",
    ceo: profile?.ceo || "N/A",
    headquarters: profile?.headquarters || "N/A",
    description: profile?.description || business.businessModel || "",
    website: profile?.website || "",
    exchange: profile?.exchange || "NASDAQ",
    currency: profile?.currency || "USD",

    // Stock Data
    currentPrice: quote?.price || 0,
    change: quote?.change || 0,
    changePercent: quote?.changePercent || 0,
    marketCap: quote?.marketCap || 0,
    volume: quote?.volume || 0,
    high52Week: quote?.high52Week || 0,
    low52Week: quote?.low52Week || 0,
    pe: quote?.pe || metrics?.peRatio || 0,
    eps: quote?.eps || metrics?.eps || 0,

    // Financials
    revenue: metrics?.revenue || 0,
    netIncome: metrics?.netIncome || 0,
    grossMargin: metrics?.grossMargin || 0,
    netMargin: metrics?.netProfitMargin || 0,
    roe: metrics?.roe || 0,
    debtToEquity: metrics?.debtToEquity || 0,
    freeCashFlow: metrics?.freeCashFlow || 0,

    // Scores
    financialScore: financial.score,
    businessScore: business.score,
    riskScore: risk.score,
    overallScore: decision.overallScore,

    // Decision
    decision: decision.decision,
    confidence: decision.confidence,

    // Narrative
    pros: decision.pros,
    cons: decision.cons,
    summary: decision.summary,
    detailedReasoning: decision.detailedReasoning,
    swot: business.swot,
    historicalRevenue: state.historicalRevenue,

    // Full agent outputs (for tabs)
    financialAnalysis: financial,
    businessAnalysis: business,
    riskAnalysis: risk,

    // Meta
    analyzedAt: new Date().toISOString(),
    dataSource: buildDataSourceString(),
    warning,
  };
}

// ============================================================
// Helpers
// ============================================================

function buildLogoUrl(websiteOrSymbol: string): string {
  if (!websiteOrSymbol) return "";
  const domain = websiteOrSymbol
    .replace(/https?:\/\//g, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split(".")[0];
  return `https://logo.clearbit.com/${domain}.com`;
}

function buildDataSourceString(): string {
  return "Groq — Llama 3.3 70B (AI-estimated data, not real-time)";
}

// Minimal fallback objects used when an agent fails
function createFallbackFinancial(): FinancialAnalysisResult {
  return {
    score: 50,
    revenue: { value: 0, trend: "stable", score: 50 },
    profitability: { value: 0, trend: "stable", score: 50 },
    growth: { value: 0, trend: "stable", score: 50 },
    cashFlow: { value: 0, trend: "adequate", score: 50 },
    debt: { value: 0, trend: "medium", score: 50 },
    valuation: { value: 0, trend: "fairly valued", score: 50 },
    summary: "Financial data unavailable.",
    strengths: [],
    weaknesses: [],
    historicalData: [],
  };
}

function createFallbackBusiness(): BusinessAnalysisResult {
  return {
    score: 50,
    businessModel: "Business information unavailable.",
    competitiveAdvantage: "N/A",
    marketPosition: "strong competitor",
    products: [],
    keyStrengths: [],
    marketOpportunities: [],
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    summary: "Business analysis unavailable.",
  };
}

function createFallbackRisk(): RiskAnalysisResult {
  const med = { level: "medium" as const, score: 50, description: "N/A" };
  return {
    score: 50,
    overallRisk: "medium",
    competitionRisk: med,
    debtRisk: med,
    regulatoryRisk: med,
    geopoliticalRisk: med,
    marketRisk: med,
    operationalRisk: med,
    topRisks: [],
    mitigations: [],
    summary: "Risk analysis unavailable.",
  };
}

function createFallbackDecision(
  financial: FinancialAnalysisResult,
  business: BusinessAnalysisResult,
  risk: RiskAnalysisResult
): InvestmentDecisionResult {
  const overallScore = Math.round(
    financial.score * 0.4 + business.score * 0.35 + risk.score * 0.25
  );
  const decision =
    overallScore >= 65 ? "invest" : overallScore >= 40 ? "hold" : "pass";
  return {
    decision,
    overallScore,
    confidence: 50,
    financialScore: financial.score,
    businessScore: business.score,
    riskScore: risk.score,
    pros: [],
    cons: [],
    summary: "Analysis complete.",
    detailedReasoning: "Analysis complete with partial data.",
    timeHorizon: "medium-term (1-3 years)",
  };
}
