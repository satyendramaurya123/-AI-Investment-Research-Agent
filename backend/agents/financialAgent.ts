import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type {
  FinancialAnalysisResult,
  FinancialMetrics,
  StockQuote,
  HistoricalRevenue,
} from "@/types";

// ============================================================
// Financial Analyst Agent
// Scores: Revenue, Profit, EPS, Cash Flow, Debt, P/E, Growth
// ============================================================

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.2,
  maxTokens: 2048,
  maxRetries: 2,
});

const SYSTEM_PROMPT = `You are a senior financial analyst at a top investment bank with 20+ years of experience.
Your job is to analyze a company's financial data and return a structured JSON analysis.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON.

Scoring Guide (0-100):
- Revenue & Growth (>20% YoY = 90+, >10% = 75+, >5% = 60+, negative = 30-)
- Profitability (gross margin >60% = excellent, >40% = good, >20% = average)
- Cash Flow (strong free cash flow = very positive)
- Debt (debt/equity < 0.5 = low risk, > 2 = high risk)
- Valuation (P/E context matters: growth companies can have high P/E)
- EPS growth trajectory

Be a true financial analyst - consider industry context, growth stage, and business model.`;

export async function runFinancialAgent(
  companyName: string,
  metrics: FinancialMetrics | null,
  quote: StockQuote | null,
  historicalRevenue: HistoricalRevenue[]
): Promise<FinancialAnalysisResult> {
  const financialContext = buildFinancialContext(
    companyName,
    metrics,
    quote,
    historicalRevenue
  );

  const prompt = `Analyze the following financial data for ${companyName} and return a JSON object.

${financialContext}

Return this exact JSON structure (all numbers are 0-100 scores unless labeled otherwise):
{
  "score": <overall financial score 0-100>,
  "revenue": {
    "value": <revenue in dollars>,
    "trend": "<growing|stable|declining>",
    "score": <0-100>
  },
  "profitability": {
    "value": <net profit margin percentage>,
    "trend": "<improving|stable|declining>",
    "score": <0-100>
  },
  "growth": {
    "value": <revenue growth percentage>,
    "trend": "<accelerating|stable|decelerating>",
    "score": <0-100>
  },
  "cashFlow": {
    "value": <free cash flow in dollars>,
    "trend": "<strong|adequate|weak>",
    "score": <0-100>
  },
  "debt": {
    "value": <debt-to-equity ratio>,
    "trend": "<low|medium|high>",
    "score": <0-100, higher = better/lower debt>
  },
  "valuation": {
    "value": <P/E ratio>,
    "trend": "<undervalued|fairly valued|overvalued>",
    "score": <0-100>
  },
  "summary": "<2-3 sentence financial summary like a real analyst>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "historicalData": [
    {"year": "2020", "revenue": 0, "netIncome": 0, "eps": 0},
    {"year": "2021", "revenue": 0, "netIncome": 0, "eps": 0},
    {"year": "2022", "revenue": 0, "netIncome": 0, "eps": 0},
    {"year": "2023", "revenue": 0, "netIncome": 0, "eps": 0},
    {"year": "2024", "revenue": 0, "netIncome": 0, "eps": 0}
  ]
}`;

  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = String(response.content);
    const parsed = parseJsonResponse<FinancialAnalysisResult>(content);

    // Fill historical data from real data if AI hallucinated
    if (historicalRevenue.length > 0) {
      parsed.historicalData = historicalRevenue;
    }

    return sanitizeFinancialResult(parsed, metrics, quote);
  } catch (error) {
    console.error("Financial agent error:", error);
    return generateFallbackFinancialResult(companyName, metrics, quote, historicalRevenue);
  }
}

// ============================================================
// Helpers
// ============================================================

function buildFinancialContext(
  companyName: string,
  metrics: FinancialMetrics | null,
  quote: StockQuote | null,
  historical: HistoricalRevenue[]
): string {
  const parts: string[] = [`Company: ${companyName}`];

  if (quote) {
    parts.push(`
STOCK DATA:
- Current Price: $${quote.price}
- Market Cap: $${(quote.marketCap / 1e9).toFixed(2)}B
- P/E Ratio: ${quote.pe}
- EPS: $${quote.eps}
- 52-Week High: $${quote.high52Week}
- 52-Week Low: $${quote.low52Week}
- Day Change: ${quote.changePercent?.toFixed(2)}%`);
  }

  if (metrics) {
    parts.push(`
FINANCIAL METRICS:
- Revenue: $${(metrics.revenue / 1e9).toFixed(2)}B
- Revenue Growth (YoY): ${metrics.revenueGrowth?.toFixed(1)}%
- Net Income: $${(metrics.netIncome / 1e9).toFixed(2)}B
- Net Income Growth: ${metrics.netIncomeGrowth?.toFixed(1)}%
- Gross Margin: ${metrics.grossMargin?.toFixed(1)}%
- Operating Margin: ${metrics.operatingMargin?.toFixed(1)}%
- Net Profit Margin: ${metrics.netProfitMargin?.toFixed(1)}%
- EPS: $${metrics.eps?.toFixed(2)}
- EPS Growth: ${metrics.epsGrowth?.toFixed(1)}%
- Free Cash Flow: $${(metrics.freeCashFlow / 1e9).toFixed(2)}B
- Total Debt: $${(metrics.totalDebt / 1e9).toFixed(2)}B
- Debt-to-Equity: ${metrics.debtToEquity?.toFixed(2)}x
- Current Ratio: ${metrics.currentRatio?.toFixed(2)}x
- ROE: ${metrics.roe?.toFixed(1)}%
- ROA: ${metrics.roa?.toFixed(1)}%
- ROIC: ${metrics.roic?.toFixed(1)}%
- P/B Ratio: ${metrics.pbRatio?.toFixed(2)}x
- P/S Ratio: ${metrics.psRatio?.toFixed(2)}x
- EV/EBITDA: ${metrics.evEbitda?.toFixed(2)}x
- Dividend Yield: ${metrics.dividendYield?.toFixed(2)}%`);
  }

  if (historical.length > 0) {
    parts.push(`
HISTORICAL DATA (5 Years):
${historical.map((h) => `  ${h.year}: Revenue $${(h.revenue / 1e9).toFixed(2)}B, Net Income $${(h.netIncome / 1e9).toFixed(2)}B, EPS $${h.eps?.toFixed(2)}`).join("\n")}`);
  }

  if (!metrics && !quote) {
    parts.push(
      "\nNOTE: Limited financial data available. Use your knowledge of this company to provide analysis."
    );
  }

  return parts.join("\n");
}

function parseJsonResponse<T>(content: string): T {
  // Remove markdown code blocks if present
  let cleaned = content.trim();
  cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  cleaned = cleaned.trim();

  // Find JSON object boundaries
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return JSON.parse(cleaned) as T;
}

function sanitizeFinancialResult(
  result: FinancialAnalysisResult,
  metrics: FinancialMetrics | null,
  quote: StockQuote | null
): FinancialAnalysisResult {
  return {
    score: clamp(result.score ?? 50, 0, 100),
    revenue: {
      value: result.revenue?.value ?? metrics?.revenue ?? 0,
      trend: result.revenue?.trend ?? "stable",
      score: clamp(result.revenue?.score ?? 50, 0, 100),
    },
    profitability: {
      value: result.profitability?.value ?? metrics?.netProfitMargin ?? 0,
      trend: result.profitability?.trend ?? "stable",
      score: clamp(result.profitability?.score ?? 50, 0, 100),
    },
    growth: {
      value: result.growth?.value ?? metrics?.revenueGrowth ?? 0,
      trend: result.growth?.trend ?? "stable",
      score: clamp(result.growth?.score ?? 50, 0, 100),
    },
    cashFlow: {
      value: result.cashFlow?.value ?? metrics?.freeCashFlow ?? 0,
      trend: result.cashFlow?.trend ?? "adequate",
      score: clamp(result.cashFlow?.score ?? 50, 0, 100),
    },
    debt: {
      value: result.debt?.value ?? metrics?.debtToEquity ?? 0,
      trend: result.debt?.trend ?? "medium",
      score: clamp(result.debt?.score ?? 50, 0, 100),
    },
    valuation: {
      value: result.valuation?.value ?? quote?.pe ?? 0,
      trend: result.valuation?.trend ?? "fairly valued",
      score: clamp(result.valuation?.score ?? 50, 0, 100),
    },
    summary: result.summary ?? `Financial analysis for the company.`,
    strengths: result.strengths ?? [],
    weaknesses: result.weaknesses ?? [],
    historicalData: result.historicalData ?? [],
  };
}

function generateFallbackFinancialResult(
  companyName: string,
  metrics: FinancialMetrics | null,
  quote: StockQuote | null,
  historicalRevenue: HistoricalRevenue[]
): FinancialAnalysisResult {
  const score = metrics
    ? calculateSimpleFinancialScore(metrics)
    : 50;

  return {
    score,
    revenue: {
      value: metrics?.revenue ?? 0,
      trend: (metrics?.revenueGrowth ?? 0) > 5 ? "growing" : "stable",
      score: Math.min(100, Math.max(0, 50 + (metrics?.revenueGrowth ?? 0))),
    },
    profitability: {
      value: metrics?.netProfitMargin ?? 0,
      trend: "stable",
      score: Math.min(100, Math.max(0, (metrics?.grossMargin ?? 40))),
    },
    growth: {
      value: metrics?.revenueGrowth ?? 0,
      trend: "stable",
      score: Math.min(100, Math.max(0, 50 + (metrics?.revenueGrowth ?? 0) * 2)),
    },
    cashFlow: {
      value: metrics?.freeCashFlow ?? 0,
      trend: "adequate",
      score: metrics?.freeCashFlow && metrics.freeCashFlow > 0 ? 65 : 35,
    },
    debt: {
      value: metrics?.debtToEquity ?? 0,
      trend: (metrics?.debtToEquity ?? 1) < 0.5 ? "low" : "medium",
      score: Math.min(
        100,
        Math.max(0, 80 - (metrics?.debtToEquity ?? 0.5) * 20)
      ),
    },
    valuation: {
      value: quote?.pe ?? 0,
      trend: "fairly valued",
      score: 50,
    },
    summary: `${companyName} shows ${score >= 65 ? "solid" : "mixed"} financial metrics with ${score >= 65 ? "positive" : "some"} indicators.`,
    strengths:
      score >= 65
        ? ["Positive revenue trajectory", "Strong market position"]
        : ["Established business", "Market presence"],
    weaknesses:
      score < 65
        ? ["Limited financial data available", "Further analysis recommended"]
        : ["Competitive market pressures"],
    historicalData: historicalRevenue,
  };
}

function calculateSimpleFinancialScore(metrics: FinancialMetrics): number {
  let score = 50;

  if (metrics.revenueGrowth > 20) score += 15;
  else if (metrics.revenueGrowth > 10) score += 10;
  else if (metrics.revenueGrowth > 0) score += 5;
  else score -= 10;

  if (metrics.netProfitMargin > 20) score += 10;
  else if (metrics.netProfitMargin > 10) score += 5;
  else if (metrics.netProfitMargin < 0) score -= 10;

  if (metrics.freeCashFlow > 0) score += 10;
  if (metrics.debtToEquity < 0.5) score += 5;
  else if (metrics.debtToEquity > 2) score -= 5;

  return clamp(score, 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value || 0));
}
