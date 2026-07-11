import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import type {
  CompanyProfile,
  StockQuote,
  FinancialMetrics,
  HistoricalRevenue,
} from "@/types";

// ============================================================
// Groq-only data source — no external financial APIs.
// All company/financial data is generated from the LLM's training
// knowledge, so figures are approximate, not real-time.
//
// IMPORTANT: free-tier LLM APIs often have small request quotas
// (as low as 20 requests/day/model on some projects). To make the
// most of that budget, everything below is fetched in ONE
// call instead of five separate ones.
// ============================================================

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.1, // low temp = more factual/consistent
  maxTokens: 3072,
  maxRetries: 2,
});

async function askLLM<T>(prompt: string): Promise<T> {
  const response = await llm.invoke([
    new HumanMessage(
      prompt +
        "\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation."
    ),
  ]);
  let text = String(response.content).trim();
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) text = text.substring(start, end + 1);
  return JSON.parse(text) as T;
}

// ============================================================
// Combined company data fetch (1 LLM call instead of 5)
// ============================================================

export interface CompanyData {
  symbol: string;
  profile: CompanyProfile | null;
  quote: StockQuote | null;
  metrics: FinancialMetrics | null;
  historicalRevenue: HistoricalRevenue[];
}

interface RawCompanyData {
  symbol: string;
  companyName: string;
  description: string;
  ceo: string;
  sector: string;
  industry: string;
  country: string;
  headquarters: string;
  website: string;
  employees: number;
  exchange: string;
  currency: string;
  ipoDate: string;
  price: number;
  marketCap: number;
  pe: number;
  eps: number;
  high52Week: number;
  low52Week: number;
  sharesOutstanding: number;
  revenue: number;
  revenueGrowth: number;
  netIncome: number;
  netIncomeGrowth: number;
  grossProfit: number;
  grossMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
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
  historicalData: Array<{ year: string; revenue: number; netIncome: number; eps: number }>;
}

export async function fetchAllCompanyData(
  companyName: string
): Promise<CompanyData> {
  try {
    const data = await askLLM<RawCompanyData>(
      `You are a financial data provider. Using your training knowledge, provide a complete
investment research data package for the public company "${companyName}".
All figures are estimates from your training data, not real-time — give your best, most
internally-consistent estimate (e.g. netIncome should be plausible given revenue and margins).
All monetary values in USD. Percentages as plain numbers (e.g. 25 for 25%).

Return exactly this JSON shape (fill every field, do not omit any):
{
  "symbol": "TICKER",
  "companyName": "Full legal company name",
  "description": "2-3 sentence company description",
  "ceo": "Current CEO name",
  "sector": "Sector (e.g. Technology)",
  "industry": "Industry (e.g. Software)",
  "country": "Country code (e.g. US)",
  "headquarters": "City, State, Country",
  "website": "https://website.com",
  "employees": 50000,
  "exchange": "NASDAQ or NYSE",
  "currency": "USD",
  "ipoDate": "YYYY-MM-DD or empty string",
  "price": 150.00,
  "marketCap": 2500000000000,
  "pe": 28.5,
  "eps": 6.11,
  "high52Week": 200.00,
  "low52Week": 120.00,
  "sharesOutstanding": 15500000000,
  "revenue": 385000000000,
  "revenueGrowth": 8.1,
  "netIncome": 97000000000,
  "netIncomeGrowth": 5.8,
  "grossProfit": 170000000000,
  "grossMargin": 44.1,
  "operatingMargin": 30.1,
  "netProfitMargin": 25.3,
  "epsGrowth": 13.0,
  "freeCashFlow": 90000000000,
  "operatingCashFlow": 110000000000,
  "totalDebt": 95000000000,
  "debtToEquity": 1.8,
  "currentRatio": 1.07,
  "quickRatio": 1.03,
  "roe": 145.0,
  "roa": 28.3,
  "roic": 55.0,
  "peRatio": 28.5,
  "pbRatio": 45.0,
  "psRatio": 7.5,
  "evEbitda": 22.0,
  "dividendYield": 0.5,
  "historicalData": [
    { "year": "2020", "revenue": 274515000000, "netIncome": 57411000000, "eps": 3.28 },
    { "year": "2021", "revenue": 365817000000, "netIncome": 94680000000, "eps": 5.61 },
    { "year": "2022", "revenue": 394328000000, "netIncome": 99803000000, "eps": 6.11 },
    { "year": "2023", "revenue": 383285000000, "netIncome": 96995000000, "eps": 6.13 },
    { "year": "2024", "revenue": 391035000000, "netIncome": 93736000000, "eps": 6.08 }
  ]
}`
    );

    const symbol = data.symbol || guessSymbol(companyName);

    const profile: CompanyProfile = {
      symbol,
      companyName: data.companyName || companyName,
      description: data.description || "",
      ceo: data.ceo || "N/A",
      sector: data.sector || "N/A",
      industry: data.industry || "N/A",
      country: data.country || "US",
      headquarters: data.headquarters || "N/A",
      website: data.website || "",
      logo: `https://logo.clearbit.com/${(data.website || "").replace(/https?:\/\//g, "").split("/")[0]}`,
      employees: data.employees || 0,
      exchange: data.exchange || "NASDAQ",
      currency: data.currency || "USD",
      ipoDate: data.ipoDate || "",
    };

    const quote: StockQuote = {
      symbol,
      price: data.price || 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      avgVolume: 0,
      marketCap: data.marketCap || 0,
      high52Week: data.high52Week || 0,
      low52Week: data.low52Week || 0,
      dayHigh: 0,
      dayLow: 0,
      open: 0,
      previousClose: data.price || 0,
      pe: data.pe || 0,
      eps: data.eps || 0,
      sharesOutstanding: data.sharesOutstanding || 0,
    };

    const metrics: FinancialMetrics = {
      revenue: data.revenue || 0,
      revenueGrowth: data.revenueGrowth || 0,
      netIncome: data.netIncome || 0,
      netIncomeGrowth: data.netIncomeGrowth || 0,
      grossProfit: data.grossProfit || 0,
      grossMargin: data.grossMargin || 0,
      operatingMargin: data.operatingMargin || 0,
      netProfitMargin: data.netProfitMargin || 0,
      eps: data.eps || 0,
      epsGrowth: data.epsGrowth || 0,
      freeCashFlow: data.freeCashFlow || 0,
      operatingCashFlow: data.operatingCashFlow || 0,
      totalDebt: data.totalDebt || 0,
      debtToEquity: data.debtToEquity || 0,
      currentRatio: data.currentRatio || 0,
      quickRatio: data.quickRatio || 0,
      roe: data.roe || 0,
      roa: data.roa || 0,
      roic: data.roic || 0,
      peRatio: data.peRatio || 0,
      pbRatio: data.pbRatio || 0,
      psRatio: data.psRatio || 0,
      evEbitda: data.evEbitda || 0,
      dividendYield: data.dividendYield || 0,
    };

    return {
      symbol,
      profile,
      quote,
      metrics,
      historicalRevenue: data.historicalData || [],
    };
  } catch (e) {
    console.error("LLM company data fetch failed:", e);
    return {
      symbol: guessSymbol(companyName),
      profile: null,
      quote: null,
      metrics: null,
      historicalRevenue: [],
    };
  }
}

// ============================================================
// Local fallback symbol guesser — no API call, used only when
// the LLM API itself is unreachable (e.g. quota exhausted).
// ============================================================

function guessSymbol(name: string): string {
  const map: Record<string, string> = {
    apple: "AAPL", microsoft: "MSFT", google: "GOOGL", alphabet: "GOOGL",
    amazon: "AMZN", meta: "META", facebook: "META", tesla: "TSLA",
    nvidia: "NVDA", netflix: "NFLX", "berkshire hathaway": "BRK.B",
    jpmorgan: "JPM", "jp morgan": "JPM", visa: "V", mastercard: "MA",
    walmart: "WMT", disney: "DIS", "johnson & johnson": "JNJ",
    samsung: "005930.KS", intel: "INTC", amd: "AMD", paypal: "PYPL",
    salesforce: "CRM", adobe: "ADBE", spotify: "SPOT", uber: "UBER",
    airbnb: "ABNB", coinbase: "COIN", palantir: "PLTR", snowflake: "SNOW",
    shopify: "SHOP", oracle: "ORCL", ibm: "IBM", cisco: "CSCO",
    qualcomm: "QCOM", broadcom: "AVGO", "texas instruments": "TXN",
  };
  const lower = name.toLowerCase().trim();
  for (const [key, symbol] of Object.entries(map)) {
    if (lower.includes(key) || key.includes(lower)) return symbol;
  }
  return name.trim().split(" ")[0].toUpperCase().substring(0, 5);
}
