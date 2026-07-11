import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type {
  InvestmentDecisionResult,
  InvestmentDecision,
  FinancialAnalysisResult,
  BusinessAnalysisResult,
  RiskAnalysisResult,
  StockQuote,
} from "@/types";

// ============================================================
// Investment Decision Agent
// Synthesizes all agent outputs into a final investment decision
// ============================================================

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.15,
  maxTokens: 3072,
  maxRetries: 2,
});

const SYSTEM_PROMPT = `You are the Chief Investment Officer (CIO) at a top-tier asset management firm.
You synthesize analysis from your financial analyst, business analyst, and risk manager
to deliver a final investment recommendation.

Decision framework:
- INVEST: Strong conviction buy. Overall score >= 65, good financials, manageable risk, positive catalysts
- HOLD: Neutral stance. Score 40-64, mixed signals, wait for better entry or more clarity  
- PASS: Avoid. Score < 40, significant concerns in financials or risk, better opportunities exist

Your recommendation must be evidence-based, citing specific data points from each analyst.
Your confidence reflects how strongly you believe in the decision (not how certain you are about future returns).

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON.`;

export async function runDecisionAgent(
  companyName: string,
  symbol: string,
  financialAnalysis: FinancialAnalysisResult,
  businessAnalysis: BusinessAnalysisResult,
  riskAnalysis: RiskAnalysisResult,
  quote: StockQuote | null
): Promise<InvestmentDecisionResult> {
  const context = buildDecisionContext(
    companyName,
    symbol,
    financialAnalysis,
    businessAnalysis,
    riskAnalysis,
    quote
  );

  const prompt = `You have received analysis reports from three specialist analysts for ${companyName} (${symbol}).
Make the final investment decision based on all the evidence.

${context}

Return this exact JSON:
{
  "decision": "<invest|hold|pass>",
  "overallScore": <weighted average score 0-100: financial 40% + business 35% + risk 25%>,
  "confidence": <your confidence in this decision 0-100>,
  "financialScore": ${financialAnalysis.score},
  "businessScore": ${businessAnalysis.score},
  "riskScore": ${riskAnalysis.score},
  "pros": [
    "<compelling reason to invest - specific data point>",
    "<another strong positive>",
    "<third positive if applicable>"
  ],
  "cons": [
    "<key concern or risk - specific>",
    "<another concern>",
    "<third concern if applicable>"
  ],
  "summary": "<3-4 sentence executive summary that a real CIO would write for their investment committee>",
  "detailedReasoning": "<5-7 sentence detailed reasoning explaining WHY you made this decision, citing specific metrics from each analyst>",
  "priceTarget": <optional: 12-month price target if current price is known, or null>,
  "timeHorizon": "<short-term (< 1 year)|medium-term (1-3 years)|long-term (3+ years)>"
}`;

  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = String(response.content);
    const parsed = parseJsonResponse<InvestmentDecisionResult>(content);

    return sanitizeDecisionResult(parsed, financialAnalysis, businessAnalysis, riskAnalysis);
  } catch (error) {
    console.error("Decision agent error:", error);
    return generateFallbackDecision(companyName, financialAnalysis, businessAnalysis, riskAnalysis);
  }
}

// ============================================================
// Helpers
// ============================================================

function buildDecisionContext(
  companyName: string,
  symbol: string,
  financial: FinancialAnalysisResult,
  business: BusinessAnalysisResult,
  risk: RiskAnalysisResult,
  quote: StockQuote | null
): string {
  const parts = [`INVESTMENT ANALYSIS SUMMARY FOR: ${companyName} (${symbol})`];

  if (quote) {
    parts.push(`
MARKET DATA:
- Current Price: $${quote.price}
- Market Cap: $${(quote.marketCap / 1e9).toFixed(2)}B
- P/E Ratio: ${quote.pe}
- 52-Week Range: $${quote.low52Week} - $${quote.high52Week}
- YTD Change: ${quote.changePercent?.toFixed(1)}%`);
  }

  parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINANCIAL ANALYST REPORT (Score: ${financial.score}/100):
${financial.summary}
Key Metrics:
- Revenue Trend: ${financial.revenue.trend} (Score: ${financial.revenue.score}/100)
- Profitability: ${financial.profitability.trend} (Score: ${financial.profitability.score}/100)
- Growth Rate: ${financial.growth.value?.toFixed(1)}% (Score: ${financial.growth.score}/100)
- Cash Flow: ${financial.cashFlow.trend} (Score: ${financial.cashFlow.score}/100)
- Debt Level: ${financial.debt.trend} (Score: ${financial.debt.score}/100)
- Valuation: ${financial.valuation.trend} (Score: ${financial.valuation.score}/100)
Strengths: ${financial.strengths.join(", ")}
Weaknesses: ${financial.weaknesses.join(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUSINESS ANALYST REPORT (Score: ${business.score}/100):
${business.summary}
Market Position: ${business.marketPosition}
Competitive Advantage: ${business.competitiveAdvantage}
Key Strengths: ${business.keyStrengths.join(", ")}
Opportunities: ${business.marketOpportunities.join(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK ANALYST REPORT (Safety Score: ${risk.score}/100, Overall Risk: ${risk.overallRisk.toUpperCase()}):
${risk.summary}
Top Risks: ${risk.topRisks.join(" | ")}
Mitigations: ${risk.mitigations.join(", ")}
Competition Risk: ${risk.competitionRisk.level}
Debt Risk: ${risk.debtRisk.level}
Regulatory Risk: ${risk.regulatoryRisk.level}
Geopolitical Risk: ${risk.geopoliticalRisk.level}`);

  const suggestedScore = Math.round(
    financial.score * 0.40 + business.score * 0.35 + risk.score * 0.25
  );

  const suggestedDecision: InvestmentDecision =
    suggestedScore >= 65 ? "invest" : suggestedScore >= 40 ? "hold" : "pass";

  parts.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WEIGHTED SCORE CALCULATION:
- Financial (40%): ${financial.score} × 0.40 = ${(financial.score * 0.40).toFixed(1)}
- Business (35%): ${business.score} × 0.35 = ${(business.score * 0.35).toFixed(1)}
- Risk (25%): ${risk.score} × 0.25 = ${(risk.score * 0.25).toFixed(1)}
- Suggested Total: ${suggestedScore}/100 → Suggested Decision: ${suggestedDecision.toUpperCase()}
(You may agree or adjust based on your analysis)`);

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

function validateDecision(decision: unknown): InvestmentDecision {
  if (decision === "invest" || decision === "hold" || decision === "pass") {
    return decision;
  }
  return "hold";
}

function sanitizeDecisionResult(
  result: Partial<InvestmentDecisionResult>,
  financial: FinancialAnalysisResult,
  business: BusinessAnalysisResult,
  risk: RiskAnalysisResult
): InvestmentDecisionResult {
  const overallScore = clamp(
    result.overallScore ??
      Math.round(financial.score * 0.40 + business.score * 0.35 + risk.score * 0.25),
    0,
    100
  );

  return {
    decision: validateDecision(result.decision),
    overallScore,
    confidence: clamp(result.confidence ?? 60, 0, 100),
    financialScore: clamp(result.financialScore ?? financial.score, 0, 100),
    businessScore: clamp(result.businessScore ?? business.score, 0, 100),
    riskScore: clamp(result.riskScore ?? risk.score, 0, 100),
    pros: result.pros ?? [],
    cons: result.cons ?? [],
    summary: result.summary ?? `Investment analysis complete for this company.`,
    detailedReasoning: result.detailedReasoning ?? result.summary ?? ``,
    priceTarget: result.priceTarget ?? undefined,
    timeHorizon: result.timeHorizon ?? "medium-term (1-3 years)",
  };
}

function generateFallbackDecision(
  companyName: string,
  financial: FinancialAnalysisResult,
  business: BusinessAnalysisResult,
  risk: RiskAnalysisResult
): InvestmentDecisionResult {
  const overallScore = Math.round(
    financial.score * 0.40 + business.score * 0.35 + risk.score * 0.25
  );

  const decision: InvestmentDecision =
    overallScore >= 65 ? "invest" : overallScore >= 40 ? "hold" : "pass";

  const confidence = Math.round(50 + (Math.abs(overallScore - 52) / 48) * 40);

  return {
    decision,
    overallScore,
    confidence: clamp(confidence, 0, 100),
    financialScore: financial.score,
    businessScore: business.score,
    riskScore: risk.score,
    pros: [
      ...(financial.strengths.slice(0, 2) ?? []),
      ...(business.keyStrengths.slice(0, 1) ?? []),
    ].slice(0, 4),
    cons: [
      ...(financial.weaknesses.slice(0, 1) ?? []),
      ...(risk.topRisks.slice(0, 2) ?? []),
    ].slice(0, 3),
    summary: `${companyName} receives an overall score of ${overallScore}/100 across financial, business, and risk dimensions. Based on this analysis, our recommendation is to ${decision.toUpperCase()} with ${confidence}% confidence.`,
    detailedReasoning: `${companyName}'s financial analysis scores ${financial.score}/100, driven by ${financial.summary}. The business analysis awards ${business.score}/100 noting ${business.marketPosition} position. Risk assessment yields a safety score of ${risk.score}/100 with ${risk.overallRisk} overall risk. The weighted combination of these scores produces an overall score of ${overallScore}/100, leading to a ${decision.toUpperCase()} recommendation.`,
    timeHorizon: "medium-term (1-3 years)",
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value || 0));
}
