import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { BusinessAnalysisResult, CompanyProfile } from "@/types";

// ============================================================
// Business Analysis Agent
// Analyzes business model, competitive moat, and SWOT
// ============================================================

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.3,
  maxTokens: 2560,
  maxRetries: 2,
});

const SYSTEM_PROMPT = `You are a senior business analyst and strategy consultant with expertise in competitive analysis.
Your role is to analyze companies from a fundamental business perspective including:
- Business model quality and durability
- Competitive advantages (moat)
- Market position and share
- Product portfolio and innovation
- Future growth opportunities
- SWOT analysis

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation outside the JSON.`;

export async function runBusinessAgent(
  companyName: string,
  profile: CompanyProfile | null
): Promise<BusinessAnalysisResult> {
  const businessContext = buildBusinessContext(companyName, profile);

  const prompt = `Analyze the business fundamentals of ${companyName} and return a JSON analysis.

${businessContext}

Return this exact JSON structure:
{
  "score": <overall business quality score 0-100>,
  "businessModel": "<1-2 sentence description of how the company makes money>",
  "competitiveAdvantage": "<the company's main competitive moat or advantage>",
  "marketPosition": "<market leader|strong competitor|niche player|emerging>",
  "products": [
    "<key product or service 1>",
    "<key product or service 2>",
    "<key product or service 3>"
  ],
  "keyStrengths": [
    "<business strength 1>",
    "<business strength 2>",
    "<business strength 3>"
  ],
  "marketOpportunities": [
    "<growth opportunity 1>",
    "<growth opportunity 2>"
  ],
  "swot": {
    "strengths": [
      "<strength 1>",
      "<strength 2>",
      "<strength 3>"
    ],
    "weaknesses": [
      "<weakness 1>",
      "<weakness 2>"
    ],
    "opportunities": [
      "<opportunity 1>",
      "<opportunity 2>"
    ],
    "threats": [
      "<threat 1>",
      "<threat 2>"
    ]
  },
  "summary": "<2-3 sentence business analysis summary from an analyst perspective>"
}`;

  try {
    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(prompt),
    ]);

    const content = String(response.content);
    const parsed = parseJsonResponse<BusinessAnalysisResult>(content);

    return sanitizeBusinessResult(parsed, companyName, profile);
  } catch (error) {
    console.error("Business agent error:", error);
    return generateFallbackBusinessResult(companyName, profile);
  }
}

// ============================================================
// Helpers
// ============================================================

function buildBusinessContext(
  companyName: string,
  profile: CompanyProfile | null
): string {
  const parts = [`Company: ${companyName}`];

  if (profile) {
    parts.push(`
COMPANY PROFILE:
- Full Name: ${profile.companyName}
- Sector: ${profile.sector}
- Industry: ${profile.industry}
- Country: ${profile.country}
- Headquarters: ${profile.headquarters}
- CEO: ${profile.ceo}
- Employees: ${profile.employees?.toLocaleString() ?? "N/A"}
- Exchange: ${profile.exchange}
- IPO Date: ${profile.ipoDate || "N/A"}
- Website: ${profile.website}

COMPANY DESCRIPTION:
${profile.description ? profile.description.substring(0, 800) : "No description available."}`);
  } else {
    parts.push(
      `\nNOTE: No company profile data available. Use your comprehensive knowledge about ${companyName} to conduct the business analysis.`
    );
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

function sanitizeBusinessResult(
  result: BusinessAnalysisResult,
  companyName: string,
  profile: CompanyProfile | null
): BusinessAnalysisResult {
  return {
    score: clamp(result.score ?? 50, 0, 100),
    businessModel: result.businessModel ?? `${companyName} operates in ${profile?.sector ?? "the technology"} sector.`,
    competitiveAdvantage: result.competitiveAdvantage ?? "Established market presence",
    marketPosition: result.marketPosition ?? "strong competitor",
    products: result.products ?? [],
    keyStrengths: result.keyStrengths ?? [],
    marketOpportunities: result.marketOpportunities ?? [],
    swot: {
      strengths: result.swot?.strengths ?? [],
      weaknesses: result.swot?.weaknesses ?? [],
      opportunities: result.swot?.opportunities ?? [],
      threats: result.swot?.threats ?? [],
    },
    summary: result.summary ?? `${companyName} shows ${result.score >= 65 ? "strong" : "moderate"} business fundamentals.`,
  };
}

function generateFallbackBusinessResult(
  companyName: string,
  profile: CompanyProfile | null
): BusinessAnalysisResult {
  return {
    score: 55,
    businessModel: `${companyName} is a ${profile?.sector ?? "technology"} company operating in the ${profile?.industry ?? "software"} industry.`,
    competitiveAdvantage: "Brand recognition and market presence",
    marketPosition: "strong competitor",
    products: ["Core product/service", "Enterprise solutions", "Platform ecosystem"],
    keyStrengths: [
      "Established brand and customer base",
      "Diversified revenue streams",
      "Strong talent pool",
    ],
    marketOpportunities: [
      "Expanding into new markets",
      "Digital transformation tailwinds",
    ],
    swot: {
      strengths: [
        "Market leadership position",
        "Strong brand recognition",
        "Robust ecosystem",
      ],
      weaknesses: [
        "Dependence on core market",
        "Competition from emerging players",
      ],
      opportunities: [
        "AI and automation integration",
        "International expansion",
        "New product categories",
      ],
      threats: [
        "Increasing competition",
        "Regulatory changes",
        "Market saturation",
      ],
    },
    summary: `${companyName} is an established company with a recognizable brand and proven business model. The company benefits from a large customer base but faces ongoing competitive pressures.`,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value || 0));
}
