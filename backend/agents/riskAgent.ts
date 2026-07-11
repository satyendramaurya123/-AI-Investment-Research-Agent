import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type {
  RiskAnalysisResult,
  RiskFactor,
  FinancialMetrics,
  CompanyProfile,
} from "@/types";

// ============================================================
// Risk Analysis Agent
// Analyzes competition, debt, regulatory, geopolitical risks
// ============================================================

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.2,
  maxTokens: 2048,
  maxRetries: 2,
});

const SYSTEM_PROMPT = `You are a risk management specialist and investment risk analyst.
Your job is to identify and quantify all material risks for an investment in this company.
Think like a professional risk manager: systematic, thorough, and unbiased.

Risk scoring: 
- A HIGH riskScore for a factor means HIGH risk (bad for investment)
- The overall "score" is a SAFETY score: 100 = very safe investment, 0 = very risky

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON.`;

export async function runRiskAgent(
  companyName: string,
  profile: CompanyProfile | null,
  metrics: FinancialMetrics | null
): Promise<RiskAnalysisResult> {
  const riskContext = buildRiskContext(companyName, profile, metrics);

  const prompt = `Conduct a comprehensive risk analysis for ${companyName} and return a JSON risk assessment.

${riskContext}

Return this exact JSON structure (score = safety score, 0-100 where higher is SAFER):
{
  "score": <overall safety score 0-100, higher means lower risk>,
  "overallRisk": "<low|medium|high>",
  "competitionRisk": {
    "level": "<low|medium|high>",
    "score": <0-100 where higher = MORE risk>,
    "description": "<brief description of competitive threats>"
  },
  "debtRisk": {
    "level": "<low|medium|high>",
    "score": <0-100 where higher = MORE risk>,
    "description": "<brief description of debt situation>"
  },
  "regulatoryRisk": {
    "level": "<low|medium|high>",
    "score": <0-100 where higher = MORE risk>,
    "description": "<brief description of regulatory environment>"
  },
  "geopoliticalRisk": {
    "level": "<low|medium|high>",
    "score": <0-100 where higher = MORE risk>,
    "description": "<brief geopolitical risk description>"
  },
  "marketRisk": {
    "level": "<low|medium|high>",
    "score": <0-100 where higher = MORE risk>,
    "description": "<market/macro risk description>"
  },
  "operationalRisk": {
    "level": "<low|medium|high>",
    "score": <0-100 where higher = MORE risk>,
    "description": "<operational risk description>"
  },
  "topRisks": [
    "<the most critical risk facing this company>",
    "<second critical risk>",
    "<third critical risk>"
  ],
  "mitigations": [
    "<how the company can or does mitigate risk 1>",
    "<mitigation for risk 2>"
  ],
  "summary": "<2-3 sentence risk summary from an analyst perspective>"
}`;

  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = String(response.content);
    const parsed = parseJsonResponse<RiskAnalysisResult>(content);

    return sanitizeRiskResult(parsed, companyName, metrics);
  } catch (error) {
    console.error("Risk agent error:", error);
    return generateFallbackRiskResult(companyName, profile, metrics);
  }
}

// ============================================================
// Helpers
// ============================================================

function buildRiskContext(
  companyName: string,
  profile: CompanyProfile | null,
  metrics: FinancialMetrics | null
): string {
  const parts = [`Company: ${companyName}`];

  if (profile) {
    parts.push(`
COMPANY INFO:
- Sector: ${profile.sector}
- Industry: ${profile.industry}  
- Country: ${profile.country}
- Employees: ${profile.employees?.toLocaleString() ?? "N/A"}`);
  }

  if (metrics) {
    parts.push(`
FINANCIAL RISK INDICATORS:
- Debt-to-Equity: ${metrics.debtToEquity?.toFixed(2)}x
- Current Ratio: ${metrics.currentRatio?.toFixed(2)}
- Total Debt: $${(metrics.totalDebt / 1e9).toFixed(2)}B
- Net Profit Margin: ${metrics.netProfitMargin?.toFixed(1)}%
- Revenue Growth: ${metrics.revenueGrowth?.toFixed(1)}%
- Free Cash Flow: $${(metrics.freeCashFlow / 1e9).toFixed(2)}B`);
  }

  return parts.join("\n");
}

function parseJsonResponse<T>(content: string): T {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  cleaned = cleaned.trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return JSON.parse(cleaned) as T;
}

function sanitizeRiskFactor(
  factor: Partial<RiskFactor> | undefined,
  defaultLevel: "low" | "medium" | "high" = "medium"
): RiskFactor {
  return {
    level: validateRiskLevel(factor?.level) ?? defaultLevel,
    score: clamp(factor?.score ?? 50, 0, 100),
    description: factor?.description ?? "Risk assessment pending.",
  };
}

function validateRiskLevel(
  level: unknown
): "low" | "medium" | "high" | undefined {
  if (level === "low" || level === "medium" || level === "high") return level;
  return undefined;
}

function sanitizeRiskResult(
  result: RiskAnalysisResult,
  companyName: string,
  metrics: FinancialMetrics | null
): RiskAnalysisResult {
  const overallRisk =
    validateRiskLevel(result.overallRisk) ??
    (metrics?.debtToEquity && metrics.debtToEquity > 2 ? "high" : "medium");

  return {
    score: clamp(result.score ?? 50, 0, 100),
    overallRisk,
    competitionRisk: sanitizeRiskFactor(result.competitionRisk),
    debtRisk: sanitizeRiskFactor(result.debtRisk),
    regulatoryRisk: sanitizeRiskFactor(result.regulatoryRisk),
    geopoliticalRisk: sanitizeRiskFactor(result.geopoliticalRisk),
    marketRisk: sanitizeRiskFactor(result.marketRisk),
    operationalRisk: sanitizeRiskFactor(result.operationalRisk),
    topRisks: result.topRisks ?? [],
    mitigations: result.mitigations ?? [],
    summary: result.summary ?? `Risk assessment for ${companyName}.`,
  };
}

function generateFallbackRiskResult(
  companyName: string,
  profile: CompanyProfile | null,
  metrics: FinancialMetrics | null
): RiskAnalysisResult {
  const debtLevel =
    !metrics
      ? "medium"
      : metrics.debtToEquity > 2
      ? "high"
      : metrics.debtToEquity > 1
      ? "medium"
      : "low";

  const safetyScore =
    debtLevel === "high" ? 35 : debtLevel === "medium" ? 55 : 70;

  const sector = profile?.sector ?? "Technology";

  return {
    score: safetyScore,
    overallRisk: debtLevel as "low" | "medium" | "high",
    competitionRisk: {
      level: "medium",
      score: 45,
      description: `${companyName} operates in a competitive ${sector} market with multiple strong players.`,
    },
    debtRisk: {
      level: debtLevel as "low" | "medium" | "high",
      score: debtLevel === "high" ? 70 : debtLevel === "medium" ? 45 : 25,
      description:
        metrics?.debtToEquity != null
          ? `Debt-to-equity ratio of ${metrics.debtToEquity.toFixed(2)}x indicates ${debtLevel} financial leverage.`
          : "Debt levels require further analysis.",
    },
    regulatoryRisk: {
      level: "medium",
      score: 45,
      description: `${sector} companies face evolving regulatory landscape. Monitor policy changes closely.`,
    },
    geopoliticalRisk: {
      level: profile?.country === "US" ? "low" : "medium",
      score: profile?.country === "US" ? 25 : 45,
      description: `Operating primarily in ${profile?.country ?? "US"} with ${profile?.country === "US" ? "lower" : "moderate"} geopolitical exposure.`,
    },
    marketRisk: {
      level: "medium",
      score: 50,
      description: "Subject to macroeconomic cycles and market sentiment shifts.",
    },
    operationalRisk: {
      level: "low",
      score: 30,
      description: "Established operations with proven execution history.",
    },
    topRisks: [
      "Competitive pressure from well-funded rivals",
      "Potential regulatory headwinds",
      "Macroeconomic slowdown impact on demand",
    ],
    mitigations: [
      "Diversified product portfolio reduces single-point dependency",
      "Strong balance sheet provides flexibility",
    ],
    summary: `${companyName} presents a ${debtLevel} overall risk profile. Key concerns include competitive dynamics and regulatory developments, while the company's financial position provides adequate buffer.`,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value || 0));
}
